const NCALAYER_ENDPOINTS = ["wss://127.0.0.1:13579/", "ws://127.0.0.1:13579/"];

type NcaLayerResponse = {
  result?: string;
  responseObject?: string;
  code?: string;
  message?: string;
  errorCode?: string;
  errorMessage?: string;
};

function connect(endpoint: string) {
  return new Promise<WebSocket>((resolve, reject) => {
    const socket = new WebSocket(endpoint);
    const timeout = window.setTimeout(() => {
      socket.close();
      reject(new Error("NCALayer connection timeout"));
    }, 2500);

    socket.onopen = () => {
      window.clearTimeout(timeout);
      resolve(socket);
    };
    socket.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("NCALayer is not available"));
    };
  });
}

async function connectNcaLayer() {
  let lastError: unknown;
  for (const endpoint of NCALAYER_ENDPOINTS) {
    try {
      return await connect(endpoint);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("NCALayer is not available");
}

function sendRequest(socket: WebSocket, payload: unknown) {
  return new Promise<NcaLayerResponse>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      socket.close();
      reject(new Error("NCALayer request timeout"));
    }, 120000);

    socket.onmessage = (event) => {
      window.clearTimeout(timeout);
      try {
        resolve(JSON.parse(String(event.data)) as NcaLayerResponse);
      } catch {
        reject(new Error("Invalid NCALayer response"));
      } finally {
        socket.close();
      }
    };
    socket.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("NCALayer request failed"));
    };
    socket.send(JSON.stringify(payload));
  });
}

export async function signAuthChallengeWithNcaLayer(challengeBase64: string) {
  const socket = await connectNcaLayer();
  const response = await sendRequest(socket, {
    module: "kz.gov.pki.knca.commonUtils",
    method: "createCMSSignatureFromBase64",
    args: ["PKCS12", "AUTHENTICATION", challengeBase64, true]
  });

  const signature = response.responseObject || response.result;
  if (!signature || response.code === "500" || response.errorCode) {
    throw new Error(response.errorMessage || response.message || "NCALayer signing failed");
  }
  return signature;
}

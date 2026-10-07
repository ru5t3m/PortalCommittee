# Локальный запуск портала в Docker

Нужен запущенный Docker Desktop с Linux-контейнерами и Docker Compose.
Выполняйте команды из корня проекта.

```powershell
docker compose up -d --build
docker compose exec api python -m app.seed.demo
```

API автоматически применяет миграции базы данных при запуске. Второй командой
загружаются контакты региональных подразделений; повторный запуск не дублирует их.

- Портал: http://localhost:3000/ru (русский), http://localhost:3000/kk (казахский).
- Документация API: http://localhost:8000/docs.
- Проверка API: http://localhost:8000/health.
- PostgreSQL: `127.0.0.1:5432`, база/пользователь/пароль: `knb`.

Порты контейнеров доступны только с локального компьютера. Данные PostgreSQL
сохраняются в томе `postgres_data` между остановками и запусками.

```powershell
# Состояние контейнеров и журналы
docker compose ps
docker compose logs --tail=100 api web

# Остановка с сохранением данных
docker compose down

# Повторный запуск
docker compose up -d
```

`NEXT_PUBLIC_API_URL` передаётся при сборке сайта: при изменении адреса API
нужно пересобрать контейнер `web`.

Если порт 8000 занят, задайте в корневом `.env` свободный порт и соответствующий
адрес API (образец настроек — `.env.example`):

```dotenv
API_PORT=8001
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
```

В этом случае документация и проверка API доступны на порту 8001. После изменения
настроек выполните `docker compose up -d --build`.

Telegram-вход требует настройки бота, FAQ-помощник — отдельного локального
LLM-сервера, а вход в админ-панель — `ADMIN_PANEL_EMAIL` и
`ADMIN_PANEL_PASSWORD_HASH` в окружении API. Эти интеграции не настроены в
базовом Compose. Для входа через ЭЦП пользователю также нужен NCALayer.

Текущие учётные данные и настройки Compose предназначены для локальной разработки.

## Проверки перед изменениями

Проверки интерфейса запускаются из `apps/web` при работающем портале:

```powershell
npm ci
npm run check
npm audit --omit=dev --audit-level=high
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
```

На компьютере без Edge установите Chromium через `npx playwright install chromium`
и не задавайте `PLAYWRIGHT_CHANNEL`. Для запуска локального производственного
сервера тестами выполните `npm run build` и задайте
`PLAYWRIGHT_START_SERVER=1`. Для другого адреса портала используется `WEB_URL`.

Серверные тесты запускаются из `apps/api`:

```powershell
pip install -r requirements-dev.txt
python -m unittest discover -s tests -v
```

Тесты создают временную базу в памяти; рабочая база PostgreSQL не используется.
GitHub Actions проверяет код, сборку, браузерные сценарии, API и зависимости.

Результаты первого этапа оптимизации и ограничения проверок:
[отчёт об оптимизации](docs/optimization-2026-10-08.md).

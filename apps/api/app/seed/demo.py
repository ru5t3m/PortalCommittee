from datetime import datetime, timezone

from app.core.security import hash_password
from app.db.session import Base, SessionLocal, engine
from app.models.entities import Document, News, Page, RegionOffice, Role, Status, User, Vacancy


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).first():
            return

        db.add_all([
            User(email="admin@knb.local", full_name="System Administrator", hashed_password=hash_password("ChangeMe123!"), role=Role.admin),
            User(email="editor@knb.local", full_name="Press Editor", hashed_password=hash_password("ChangeMe123!"), role=Role.editor),
        ])
        db.add_all([
            News(
                title_kk="Ресми хабарлама",
                title_ru="Официальное заявление",
                title_en="Official statement",
                summary_kk="Ұлттық қауіпсіздік мәселелері бойынша ресми ақпарат.",
                summary_ru="Официальная информация по вопросам национальной безопасности.",
                summary_en="Official information on national security matters.",
                body_kk="Комитет азаматтарды тек ресми дереккөздерге сүйенуге шақырады.",
                body_ru="Комитет призывает граждан ориентироваться на официальные источники информации.",
                body_en="The Committee encourages citizens to rely on official information sources.",
                category="statement",
                status=Status.published,
                published_at=datetime.now(timezone.utc),
            ),
            News(
                title_kk="Киберқауіпсіздік бойынша ескерту",
                title_ru="Памятка по кибербезопасности",
                title_en="Cybersecurity guidance",
                summary_kk="Жеке деректерді қорғау бойынша қысқа ұсыныстар.",
                summary_ru="Краткие рекомендации по защите персональных данных.",
                summary_en="Short recommendations for personal data protection.",
                body_kk="Күмәнді сілтемелерді ашпаңыз және құпиясөздерді жаңартыңыз.",
                body_ru="Не открывайте подозрительные ссылки и регулярно обновляйте пароли.",
                body_en="Do not open suspicious links and update passwords regularly.",
                category="safety",
                status=Status.published,
                published_at=datetime.now(timezone.utc),
            ),
        ])
        db.add_all([
            Page(slug="mission", title_kk="Миссия және міндеттер", title_ru="Миссия и задачи", title_en="Mission and objectives", body_kk="Заңдылық, азаматтардың қауіпсіздігі және ұлттық мүдделерді қорғау.", body_ru="Законность, безопасность граждан и защита национальных интересов.", body_en="Rule of law, citizen safety, and protection of national interests.", status=Status.published),
            Page(slug="history", title_kk="Тарих", title_ru="История", title_en="History", body_kk="Қауіпсіздік органдарының қалыптасуы туралы анықтамалық бөлім.", body_ru="Справочный раздел о становлении органов безопасности.", body_en="Reference section on the development of security institutions.", status=Status.published),
        ])
        db.add_all([
            Vacancy(title_kk="Ақпараттық қауіпсіздік талдаушысы", title_ru="Аналитик информационной безопасности", title_en="Information security analyst", region="Астана", department="Кибербезопасность", requirements="Высшее образование, аналитическое мышление, знание ИБ."),
            Vacancy(title_kk="Шекара қызметі маманы", title_ru="Специалист пограничной службы", title_en="Border service specialist", region="Алматы", department="Пограничная безопасность", requirements="Гражданство РК, здоровье, готовность к службе."),
        ])
        db.add_all([
            Document(title_kk="Ұлттық қауіпсіздік туралы заң", title_ru="Закон о национальной безопасности", title_en="National Security Law", document_type="law", file_url="/documents/national-security-law.pdf"),
            Document(title_kk="Өтініштерді қарау регламенті", title_ru="Регламент рассмотрения обращений", title_en="Appeals review regulation", document_type="regulation", file_url="/documents/appeals-regulation.pdf"),
        ])
        db.add_all([
            RegionOffice(region="Астана", address="пр. Мәңгілік Ел, 10", phone="+7 7172 000 000", email="astana@example.gov.kz", latitude="51.128", longitude="71.430"),
            RegionOffice(region="Алматы", address="ул. Байзакова, 100", phone="+7 727 000 000", email="almaty@example.gov.kz", latitude="43.238", longitude="76.945"),
        ])
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()

from datetime import datetime, timezone

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.entities import News, Page, RegionOffice, Role, Status, User


def seed() -> None:
    db = SessionLocal()
    settings = get_settings()
    try:
        staff_users: list[User] = []
        for telegram_id in settings.telegram_admin_ids:
            if not db.query(User).filter(User.telegram_id == telegram_id).first():
                staff_users.append(
                    User(
                        email=None,
                        full_name=f"Telegram admin {telegram_id}",
                        hashed_password=None,
                        telegram_id=telegram_id,
                        role=Role.admin,
                    )
                )
        for telegram_id in settings.telegram_moderator_ids:
            if not db.query(User).filter(User.telegram_id == telegram_id).first():
                staff_users.append(
                    User(
                        email=None,
                        full_name=f"Telegram moderator {telegram_id}",
                        hashed_password=None,
                        telegram_id=telegram_id,
                        role=Role.moderator,
                    )
                )
        db.add_all(staff_users)
        if db.query(News).first():
            db.commit()
            return

        db.add_all([
            News(
                title_kk="Ресми хабарлама",
                title_ru="Официальное заявление",
                summary_kk="Ұлттық қауіпсіздік мәселелері бойынша ресми ақпарат.",
                summary_ru="Официальная информация по вопросам национальной безопасности.",
                body_kk="Комитет азаматтарды тек ресми дереккөздерге сүйенуге шақырады.",
                body_ru="Комитет призывает граждан ориентироваться на официальные источники информации.",
                category="statement",
                status=Status.published,
                published_at=datetime.now(timezone.utc),
            ),
            News(
                title_kk="Киберқауіпсіздік бойынша ескерту",
                title_ru="Памятка по кибербезопасности",
                summary_kk="Жеке деректерді қорғау бойынша қысқа ұсыныстар.",
                summary_ru="Краткие рекомендации по защите персональных данных.",
                body_kk="Күмәнді сілтемелерді ашпаңыз және құпиясөздерді жаңартыңыз.",
                body_ru="Не открывайте подозрительные ссылки и регулярно обновляйте пароли.",
                category="safety",
                status=Status.published,
                published_at=datetime.now(timezone.utc),
            ),
        ])
        db.add_all([
            Page(slug="mission", title_kk="Миссия және міндеттер", title_ru="Миссия и задачи", body_kk="Заңдылық, азаматтардың қауіпсіздігі және ұлттық мүдделерді қорғау.", body_ru="Законность, безопасность граждан и защита национальных интересов.", status=Status.published),
            Page(slug="history", title_kk="Тарих", title_ru="История", body_kk="Қауіпсіздік органдарының қалыптасуы туралы анықтамалық бөлім.", body_ru="Справочный раздел о становлении органов безопасности.", status=Status.published),
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

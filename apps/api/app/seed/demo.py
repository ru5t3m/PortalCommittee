import json
from pathlib import Path

from app.db.session import SessionLocal
from app.models.entities import RegionOffice

CONTACTS_PATH = Path(__file__).with_name("region_offices.json")


def seed() -> None:
    db = SessionLocal()
    try:
        rows = json.loads(CONTACTS_PATH.read_text(encoding="utf-8"))
        for office in db.query(RegionOffice).all():
            if office.name_ru == office.region_ru and office.name_kk == office.region_kk:
                db.delete(office)
        db.flush()
        existing = {
            (office.service, office.name_ru, office.region_ru)
            for office in db.query(RegionOffice).all()
        }
        db.add_all([
            RegionOffice(**row)
            for row in rows
            if (row["service"], row["name_ru"], row["region_ru"]) not in existing
        ])
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()

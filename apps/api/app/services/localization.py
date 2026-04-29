SUPPORTED_LOCALES = {"kk", "ru", "en"}


def pick_locale(locale: str | None) -> str:
    return locale if locale in SUPPORTED_LOCALES else "ru"


def localized(entity: object, field: str, locale: str) -> str:
    return getattr(entity, f"{field}_{pick_locale(locale)}")

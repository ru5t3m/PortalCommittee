from __future__ import annotations

from pathlib import Path
from copy import deepcopy

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from docx.shared import Pt


SRC = Path("/Users/Rustem/Downloads/Техническая_спецификация_портал_КНБ_РК.docx")
OUT = Path("Техническая_спецификация_портал_КНБ_РК_исправленная.docx")


def set_run(run, bold=None):
    run.font.name = "Times New Roman"
    run._element.rPr.rFonts.set(qn("w:ascii"), "Times New Roman")
    run._element.rPr.rFonts.set(qn("w:hAnsi"), "Times New Roman")
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    run.font.size = Pt(12)
    if bold is not None:
        run.bold = bold


def replace_text(paragraph, text):
    style = paragraph.style
    paragraph.clear()
    paragraph.style = style
    run = paragraph.add_run(text)
    set_run(run)


def insert_after(paragraph, text="", style=None, bold=None, copy_num_from=None):
    new_p = OxmlElement("w:p")
    paragraph._p.addnext(new_p)
    new_para = Paragraph(new_p, paragraph._parent)
    new_para.style = style or paragraph.style
    new_para.paragraph_format.space_after = Pt(2 if new_para.style.name == "List Bullet" else 6)
    new_para.paragraph_format.line_spacing = 1.08
    if copy_num_from is not None:
        src_ppr = copy_num_from._p.pPr
        if src_ppr is not None and src_ppr.numPr is not None:
            ppr = new_para._p.get_or_add_pPr()
            old_num = ppr.numPr
            if old_num is not None:
                ppr.remove(old_num)
            ppr.append(deepcopy(src_ppr.numPr))
    if text:
        run = new_para.add_run(text)
        set_run(run, bold=bold)
    return new_para


def delete_paragraph(paragraph):
    element = paragraph._element
    element.getparent().remove(element)


def find_para(doc, text):
    for p in doc.paragraphs:
        if p.text.strip() == text:
            return p
    raise ValueError(f"Paragraph not found: {text}")


def find_contains(doc, snippet):
    for p in doc.paragraphs:
        if snippet in p.text:
            return p
    raise ValueError(f"Paragraph containing snippet not found: {snippet}")


def main():
    doc = Document(SRC)

    replacements = {
        "регистрацию кандидата посредством ЭЦП или через email и пароль;":
            "регистрацию кандидата посредством ЭЦП или через email и пароль;",
        "предоставляет форму регистрации кандидата посредством ЭЦП или через email и пароль;":
            "предоставляет форму регистрации и авторизации кандидата посредством ЭЦП или через email и пароль;",
        "Модуль обеспечивает JWT access tokens, refresh-token sessions, HttpOnly refresh cookie, Telegram phone ownership check, password hashing, RBAC, admin-session separation, throttling, CORS allowlist, trusted hosts и журналирование.":
            "Модуль обеспечивает авторизацию посредством ЭЦП, JWT access tokens, refresh-token sessions, HttpOnly refresh cookie, password hashing, RBAC, admin-session separation, throttling, CORS allowlist, trusted hosts и журналирование.",
        "проверку Telegram webhook secret в production;":
            "проверку подлинности ЭЦП и корректности авторизационного challenge;",
        "проверку принадлежности Telegram-контакта пользователю;":
            "проверку действительности сертификата ЭЦП и соответствия идентификационных данных пользователя;",
        "Telegram-аутентификация с подтверждением номера телефона;":
            "авторизация посредством ЭЦП с проверкой сертификата и подписанного challenge;",
        "Telegram-аутентификация создает пользователя после подтверждения номера телефона;":
            "авторизация посредством ЭЦП создает или подтверждает пользователя после успешной проверки сертификата и подписанного challenge;",
        "подписание документов ЭЦП;":
            "подписание и подача юридически значимых документов через портал;",
    }

    for p in doc.paragraphs:
        stripped = p.text.strip()
        if stripped in replacements:
            replace_text(p, replacements[stripped])

    # Add EDS specifics after the general auth/session paragraph.
    auth_heading = find_para(doc, "Аутентификация и управление сессиями")
    first_auth_item = find_para(doc, "авторизация посредством ЭЦП с проверкой сертификата и подписанного challenge;")
    p = insert_after(
        first_auth_item,
        "проверка ЭЦП выполняется на стороне сервера без передачи закрытого ключа пользователя в систему;",
        style=first_auth_item.style,
        copy_num_from=first_auth_item,
    )
    p = insert_after(
        p,
        "результаты проверки ЭЦП используются только для подтверждения личности и создания авторизованной сессии;",
        style=first_auth_item.style,
        copy_num_from=first_auth_item,
    )

    # Add AI bot to functional scope after reporting.
    reporting = find_contains(doc, "Экспорт отчетов в файлы в первой версии не реализуется.")
    h = insert_after(reporting, "ИИ-бот консультирования пользователей", style=doc.styles["Heading 2"], bold=True)
    replace_text(h, "ИИ-бот консультирования пользователей")
    p = insert_after(
        h,
        "В системе реализуется ИИ-бот для первичного консультирования пользователей по открытым разделам портала, правилам подачи первичной заявки, порядку поступления на службу и учебу, прохождению психологического тестирования, статусам обращений и навигации по личному кабинету кандидата.",
        style=doc.styles["normal"],
    )
    p = insert_after(p, "Функционал ИИ-бота включает:", style=doc.styles["normal"])
    bullet_template = find_para(doc, "количество обращений по статусам;")
    items = [
        "ответы на типовые вопросы пользователей на русском и казахском языках;",
        "поиск ответа по утвержденной базе знаний портала;",
        "подсказки по заполнению первичной формы обращения;",
        "разъяснение статусов обращения и кандидатской заявки;",
        "навигационные подсказки по разделам портала;",
        "передачу сложного вопроса пользователю в обычный канал обращения без автоматического принятия решений;",
        "журналирование технических ошибок работы ИИ-бота без сохранения лишних персональных данных.",
    ]
    for item in items:
        p = insert_after(p, item, style=bullet_template.style, copy_num_from=bullet_template)

    # Add architecture/security module for local AI model.
    ai_anchor = find_para(doc, "Модуль безопасности")
    h = insert_after(ai_anchor._p.getprevious() is not None and ai_anchor or ai_anchor, "Модуль ИИ-бота", style=doc.styles["Heading 3"], bold=True)
    # Move the new module before security heading by inserting after the previous module paragraph instead.
    delete_paragraph(h)
    prev_para = None
    for idx, para in enumerate(doc.paragraphs):
        if para.text.strip() == "Модуль безопасности":
            prev_para = doc.paragraphs[idx - 1]
            break
    h = insert_after(prev_para, "Модуль ИИ-бота", style=doc.styles["Heading 3"], bold=True)
    p = insert_after(
        h,
        "Модуль обеспечивает работу встроенного консультанта на базе локальной легкой ИИ-модели, размещенной на серверной инфраструктуре системы. Обработка пользовательских вопросов выполняется внутри серверного контура без направления запросов, текстов обращений, персональных данных или служебной информации в сторонние ИИ-сервисы.",
        style=doc.styles["normal"],
    )
    insert_after(
        p,
        "ИИ-бот использует только утвержденную базу знаний портала и открытые справочные материалы, не принимает юридически значимых решений, не изменяет статусы обращений и кандидатских заявок и не подменяет ответственного сотрудника.",
        style=doc.styles["normal"],
    )

    # Add security controls for the AI bot.
    sec_anchor = find_para(doc, "периодический аудит зависимостей frontend и backend.")
    p = insert_after(sec_anchor, "локальную обработку запросов ИИ-бота без передачи данных в сторонние сервисы;", style=sec_anchor.style, copy_num_from=sec_anchor)
    insert_after(p, "ограничение базы знаний ИИ-бота утвержденными материалами портала и служебно разрешенными справочными текстами;", style=sec_anchor.style, copy_num_from=sec_anchor)

    # Add acceptance criterion for AI bot.
    acc_anchor = find_para(doc, "content CRUD работает для страниц, новостей и региональных контактов;")
    p = insert_after(acc_anchor, "ИИ-бот отвечает на типовые вопросы по утвержденной базе знаний портала;", style=acc_anchor.style, copy_num_from=acc_anchor)
    insert_after(p, "работа ИИ-бота выполняется локальной легкой моделью на сервере без запросов в сторонние ИИ-сервисы;", style=acc_anchor.style, copy_num_from=acc_anchor)

    doc.save(OUT)
    print(OUT.resolve())


if __name__ == "__main__":
    main()

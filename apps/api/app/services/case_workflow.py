from fastapi import HTTPException, Query
from sqlalchemy import or_, cast, String


class ListOptions:
    def __init__(self, q: str = Query(default="", max_length=200),
                 limit: int = Query(default=25, ge=1, le=100), offset: int = Query(default=0, ge=0),
                 paginated: bool = False):
        self.q, self.limit, self.offset, self.paginated = q.strip(), limit, offset, paginated


class CaseFilters:
    def __init__(self, status: str | None = Query(default=None, max_length=30),
                 organizational_unit_id: int | None = Query(default=None, gt=0),
                 assigned_to_id: int | None = Query(default=None, gt=0), unassigned: bool = False):
        self.status, self.unit, self.assignee, self.unassigned = status, organizational_unit_id, assigned_to_id, unassigned


def search(query, term, columns):
    if term:
        pattern = "%" + term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
        query = query.filter(or_(*(cast(column, String).ilike(pattern, escape="\\") for column in columns)))
    return query


def filter_cases(query, model, filters):
    if filters.status:
        allowed = {item.value for item in model.status.type.enum_class}
        if filters.status not in allowed:
            raise HTTPException(422, "Unknown status")
        query = query.filter(model.status == filters.status)
    if filters.unit is not None:
        query = query.filter(model.organizational_unit_id == filters.unit)
    if filters.assignee is not None:
        query = query.filter(model.assigned_to_id == filters.assignee)
    if filters.unassigned:
        query = query.filter(model.assigned_to_id.is_(None))
    return query


def page(query, options, serializer=lambda row: row):
    total = query.order_by(None).count()
    items = [serializer(row) for row in query.offset(options.offset).limit(options.limit).all()]
    if options.paginated:
        return dict(items=items, total=total, limit=options.limit, offset=options.offset)
    return items

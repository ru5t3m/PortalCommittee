from alembic import op
import sqlalchemy as sa

revision = "20261010_0008"
down_revision = "20261008_0007"
branch_labels = None
depends_on = None

CHECKS = {
    "psychological_test_results": {
        "ck_test_result_counts": "total_questions > 0 AND answered_questions >= 0 AND answered_questions <= total_questions",
        "ck_test_result_time": "duration_seconds >= 0 AND remaining_seconds >= 0 AND remaining_seconds <= duration_seconds",
    },
    "psychological_test_progress": {
        "ck_test_progress_counts": "total_questions > 0 AND answered_questions >= 0 AND answered_questions <= total_questions",
        "ck_test_progress_section": "current_section_index >= 0",
    },
    "psychological_test_attempts": {
        "ck_test_attempt_status": "status IN ('instructions', 'questions', 'sectionComplete', 'ready', 'completed')",
        "ck_test_attempt_locale": "locale IN ('ru', 'kk')",
        "ck_test_attempt_counters": "section_index >= 0 AND question_index >= 0 AND elapsed_milliseconds >= 0 AND version >= 1",
        "ck_test_attempt_timer": "(status = 'questions' AND question_started_at IS NOT NULL) OR (status <> 'questions' AND question_started_at IS NULL)",
        "ck_test_attempt_active_key": "(status = 'completed' AND active_key IS NULL) OR (status <> 'completed' AND active_key IS NOT NULL AND active_key = CAST(user_id AS VARCHAR) || ':' || test_slug)",
        "ck_test_attempt_instructions": "status <> 'instructions' OR question_index = 0",
        "ck_test_attempt_primary_v1_bounds": "bank_version <> 'primary-selection.v1' OR (test_slug = 'primary-selection' AND section_index BETWEEN 0 AND 2 AND question_index < CASE WHEN section_index < 2 THEN 50 ELSE 30 END AND elapsed_milliseconds <= 7800000 AND (status NOT IN ('ready', 'completed') OR section_index = 2) AND (status <> 'sectionComplete' OR section_index < 2))",
    },
}

INDEXES = {
    "appeals": [("ix_appeals_assigned_to_id", ["assigned_to_id"]), ("ix_appeals_created_at", ["created_at"])],
    "candidate_applications": [("ix_candidate_applications_created_at", ["created_at"])],
    "audit_logs": [("ix_audit_logs_actor_id", ["actor_id"])],
    "login_attempts": [("ix_login_attempts_user_id", ["user_id"])],
    "psychological_test_results": [("ix_test_results_user_submitted", ["user_id", "submitted_at"])],
    "psychological_test_attempts": [("ix_test_attempts_user_slug_created", ["user_id", "test_slug", "created_at", "id"])],
}


def upgrade():
    connection = op.get_bind()
    if connection.dialect.name == "postgresql":
        op.execute("SET LOCAL lock_timeout = '5s'")
    inspector = sa.inspect(connection)
    nonce_indexes = inspector.get_indexes("eds_login_challenges")
    if not any(index["unique"] and index["column_names"] == ["nonce"] and not index.get("duplicates_constraint") for index in nonce_indexes):
        raise RuntimeError("A separate unique nonce index is required before removing the duplicate constraint")
    with op.batch_alter_table("eds_login_challenges", naming_convention={"uq": "uq_%(table_name)s_%(column_0_name)s"}) as batch:
        for constraint in inspector.get_unique_constraints("eds_login_challenges"):
            if constraint["column_names"] == ["nonce"]:
                batch.drop_constraint(constraint["name"] or "uq_eds_login_challenges_nonce", type_="unique")
    for table, constraints in CHECKS.items():
        with op.batch_alter_table(table) as batch:
            for name, expression in constraints.items():
                batch.create_check_constraint(name, expression)
    for table, indexes in INDEXES.items():
        for name, columns in indexes:
            op.create_index(name, table, columns)
    for name, column in (("ix_login_failed_email_created", "email"), ("ix_login_failed_ip_created", "ip_address")):
        op.create_index(name, "login_attempts", [column, "created_at"], postgresql_where=sa.text("success IS FALSE"), sqlite_where=sa.text("success IS FALSE"))
    op.drop_index("ix_login_attempts_email", table_name="login_attempts")
    op.drop_index("ix_login_attempts_ip_address", table_name="login_attempts")
    predicate = sa.text("auth_session_id IS NOT NULL AND revoked_at IS NULL")
    op.create_index("uq_refresh_session_unrevoked", "refresh_sessions", ["auth_session_id"], unique=True, postgresql_where=predicate, sqlite_where=predicate)


def downgrade():
    if op.get_bind().dialect.name == "postgresql":
        op.execute("SET LOCAL lock_timeout = '5s'")
    op.drop_index("uq_refresh_session_unrevoked", table_name="refresh_sessions")
    op.create_index("ix_login_attempts_email", "login_attempts", ["email"])
    op.create_index("ix_login_attempts_ip_address", "login_attempts", ["ip_address"])
    op.drop_index("ix_login_failed_email_created", table_name="login_attempts")
    op.drop_index("ix_login_failed_ip_created", table_name="login_attempts")
    for table, indexes in reversed(list(INDEXES.items())):
        for name, columns in reversed(indexes):
            op.drop_index(name, table_name=table)
    for table, constraints in reversed(list(CHECKS.items())):
        with op.batch_alter_table(table) as batch:
            for name in constraints:
                batch.drop_constraint(name, type_="check")
    with op.batch_alter_table("eds_login_challenges") as batch:
        batch.create_unique_constraint("eds_login_challenges_nonce_key", ["nonce"])

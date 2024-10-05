CREATE TABLE if not exists public.ai_responses (
	id uuid NOT NULL,
	created_date timestamp not null default CURRENT_TIMESTAMP,
	project_name varchar(255) NOT NULL,
	sys_command varchar(10000) NULL,
	usr_command varchar(1000000) NULL,
	ai_response jsonb NULL,
	"user" varchar(255) NULL,
	CONSTRAINT ai_responses_pk PRIMARY KEY (id)
);


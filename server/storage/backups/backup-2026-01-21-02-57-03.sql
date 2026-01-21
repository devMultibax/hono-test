--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ActionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ActionType" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT'
);


ALTER TYPE public."ActionType" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: Status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public."Status" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: department; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.department (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    status public."Status" DEFAULT 'active'::public."Status" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" character varying(100) NOT NULL,
    "updatedAt" timestamp(3) without time zone,
    "updatedBy" character varying(100)
);


ALTER TABLE public.department OWNER TO postgres;

--
-- Name: department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.department_id_seq OWNER TO postgres;

--
-- Name: department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.department_id_seq OWNED BY public.department.id;


--
-- Name: section; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section (
    id integer NOT NULL,
    "departmentId" integer NOT NULL,
    name character varying(100) NOT NULL,
    status public."Status" DEFAULT 'active'::public."Status" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" character varying(100) NOT NULL,
    "updatedAt" timestamp(3) without time zone,
    "updatedBy" character varying(100)
);


ALTER TABLE public.section OWNER TO postgres;

--
-- Name: section_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.section_id_seq OWNER TO postgres;

--
-- Name: section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.section_id_seq OWNED BY public.section.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    username character(6) NOT NULL,
    password character varying(255) NOT NULL,
    "firstName" character varying(100) NOT NULL,
    "lastName" character varying(100) NOT NULL,
    "departmentId" integer NOT NULL,
    "sectionId" integer,
    email character varying(255),
    tel character(10),
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    status public."Status" DEFAULT 'active'::public."Status" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" character varying(100) NOT NULL,
    "updatedAt" timestamp(3) without time zone,
    "updatedBy" character varying(100),
    "lastLoginAt" timestamp(3) without time zone,
    "isDefaultPassword" boolean DEFAULT false NOT NULL,
    "tokenVersion" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: user_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_log (
    id integer NOT NULL,
    username character(6) NOT NULL,
    "firstName" character varying(100) NOT NULL,
    "lastName" character varying(100) NOT NULL,
    department character varying(100) NOT NULL,
    section character varying(100) NOT NULL,
    email character varying(255),
    tel character(10),
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    status public."Status" DEFAULT 'active'::public."Status" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" character varying(100) NOT NULL,
    "updatedAt" timestamp(3) without time zone,
    "updatedBy" character varying(100),
    "actionType" public."ActionType" NOT NULL,
    "actionAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_log OWNER TO postgres;

--
-- Name: user_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_log_id_seq OWNER TO postgres;

--
-- Name: user_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_log_id_seq OWNED BY public.user_log.id;


--
-- Name: department id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department ALTER COLUMN id SET DEFAULT nextval('public.department_id_seq'::regclass);


--
-- Name: section id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section ALTER COLUMN id SET DEFAULT nextval('public.section_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: user_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_log ALTER COLUMN id SET DEFAULT nextval('public.user_log_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
be4bc135-e83a-4ea3-a218-0f07f0f84ee9	239a245bd6676007d3c7d0c4425fc3e8354ae28f2f08d31f76b51b9ef781a03a	2026-01-16 13:45:58.682915+07	20260116032604_init	\N	\N	2026-01-16 13:45:58.676576+07	1
7d85f600-9678-4fa6-b32d-ed188bb615b2	a949d367b6e969ca7b5470b8ad0eddd1808113fc42af52d8b5a4b760494a9749	2026-01-16 13:45:58.704659+07	20260116063459_init	\N	\N	2026-01-16 13:45:58.683322+07	1
16b42a3d-5df0-4ade-bed8-3a6970b50a93	7887cde0b24787018fdc81b43e39207eb46cf33d26a0def99edd133826aec1c8	2026-01-16 13:47:12.25543+07	20260116064712_init	\N	\N	2026-01-16 13:47:12.249765+07	1
d031f167-64e5-4f62-b8d4-905cff0f9170	0f3e1d2e7bc070cb9793a3ed06c89ca498ef2e75b72e58403684c0c975c26ea3	2026-01-16 16:14:38.859251+07	20260116091438_add_missing_user_fields	\N	\N	2026-01-16 16:14:38.856808+07	1
767d9d8a-704b-4dff-b3fa-38693c321b3b	50b9f810a9f3c5c5ccc9dbba5f6d97e140889809885cc3586aa002214522e1dd	2026-01-19 14:29:10.543228+07	20260119072910_add_pagination_indexes	\N	\N	2026-01-19 14:29:10.529077+07	1
\.


--
-- Data for Name: department; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.department (id, name, status, "createdAt", "createdBy", "updatedAt", "updatedBy") FROM stdin;
1	STD	active	2026-01-16 06:52:22.593	SYSTEM	2026-01-16 06:52:22.593	\N
2	ST	active	2026-01-16 06:52:22.797	SYSTEM	2026-01-16 06:52:22.797	\N
3	SE	active	2026-01-16 06:52:22.803	SYSTEM	2026-01-16 06:52:22.803	\N
4	SAF	active	2026-01-16 06:52:22.807	SYSTEM	2026-01-16 06:52:22.807	\N
5	PD5	active	2026-01-16 06:52:22.811	SYSTEM	2026-01-16 06:52:22.811	\N
6	PD3	active	2026-01-16 06:52:22.816	SYSTEM	2026-01-16 06:52:22.816	\N
7	PD2	active	2026-01-16 06:52:22.82	SYSTEM	2026-01-16 06:52:22.82	\N
8	PD1	active	2026-01-16 06:52:22.824	SYSTEM	2026-01-16 06:52:22.824	\N
9	PD	active	2026-01-16 06:52:22.829	SYSTEM	2026-01-16 06:52:22.829	\N
10	PC	active	2026-01-16 06:52:22.834	SYSTEM	2026-01-16 06:52:22.834	\N
11	PA	active	2026-01-16 06:52:22.839	SYSTEM	2026-01-16 06:52:22.839	\N
12	MT5	active	2026-01-16 06:52:22.844	SYSTEM	2026-01-16 06:52:22.844	\N
13	MT3	active	2026-01-16 06:52:22.848	SYSTEM	2026-01-16 06:52:22.848	\N
14	MT2	active	2026-01-16 06:52:22.852	SYSTEM	2026-01-16 06:52:22.852	\N
15	MT1	active	2026-01-16 06:52:22.856	SYSTEM	2026-01-16 06:52:22.856	\N
16	FN	active	2026-01-16 06:52:22.86	SYSTEM	2026-01-16 06:52:22.86	\N
17	EN	active	2026-01-16 06:52:22.864	SYSTEM	2026-01-16 06:52:22.864	\N
18	BIO	active	2026-01-16 06:52:22.867	SYSTEM	2026-01-16 06:52:22.867	\N
19	ADM	active	2026-01-16 06:52:22.87	SYSTEM	2026-01-16 06:52:22.87	\N
20	AC	active	2026-01-16 06:52:22.874	SYSTEM	2026-01-16 06:52:22.874	\N
21	QC	active	2026-01-16 06:52:22.877	SYSTEM	2026-01-16 06:52:22.877	\N
22	PN	active	2026-01-16 06:52:22.88	SYSTEM	2026-01-16 06:52:22.88	\N
23	IT	active	2026-01-16 06:52:22.884	SYSTEM	2026-01-16 06:52:22.884	\N
\.


--
-- Data for Name: section; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section (id, "departmentId", name, status, "createdAt", "createdBy", "updatedAt", "updatedBy") FROM stdin;
1	19	ADMIN	active	2026-01-16 06:52:22.892	SYSTEM	2026-01-16 06:52:22.892	\N
2	8	1/1	active	2026-01-16 06:52:22.9	SYSTEM	2026-01-16 06:52:22.9	\N
3	8	1/2	active	2026-01-16 06:52:22.904	SYSTEM	2026-01-16 06:52:22.904	\N
4	8	1/3	active	2026-01-16 06:52:22.907	SYSTEM	2026-01-16 06:52:22.907	\N
5	7	2/1	active	2026-01-16 06:52:22.911	SYSTEM	2026-01-16 06:52:22.911	\N
6	7	2/2	active	2026-01-16 06:52:22.915	SYSTEM	2026-01-16 06:52:22.915	\N
7	7	2/3	active	2026-01-16 06:52:22.919	SYSTEM	2026-01-16 06:52:22.919	\N
8	6	3/1	active	2026-01-16 06:52:22.923	SYSTEM	2026-01-16 06:52:22.923	\N
9	6	3/2	active	2026-01-16 06:52:22.927	SYSTEM	2026-01-16 06:52:22.927	\N
10	6	3/3	active	2026-01-16 06:52:22.93	SYSTEM	2026-01-16 06:52:22.93	\N
11	6	3/4	active	2026-01-16 06:52:22.934	SYSTEM	2026-01-16 06:52:22.934	\N
12	5	5/2	active	2026-01-16 06:52:22.939	SYSTEM	2026-01-16 06:52:22.939	\N
13	21	QC	active	2026-01-16 06:52:22.943	SYSTEM	2026-01-16 06:52:22.943	\N
14	21	QC1	active	2026-01-16 06:52:22.947	SYSTEM	2026-01-16 06:52:22.947	\N
15	21	QC2	active	2026-01-16 06:52:22.95	SYSTEM	2026-01-16 06:52:22.95	\N
16	21	QC3	active	2026-01-16 06:52:22.953	SYSTEM	2026-01-16 06:52:22.953	\N
17	21	QC5	active	2026-01-16 06:52:22.957	SYSTEM	2026-01-16 06:52:22.957	\N
18	21	LAB	active	2026-01-16 06:52:22.959	SYSTEM	2026-01-16 06:52:22.959	\N
19	21	FG	active	2026-01-16 06:52:22.964	SYSTEM	2026-01-16 06:52:22.964	\N
20	21	CBT	active	2026-01-16 06:52:22.968	SYSTEM	2026-01-16 06:52:22.968	\N
21	2	DR&FG	active	2026-01-16 06:52:22.973	SYSTEM	2026-01-16 06:52:22.973	\N
22	2	PF	active	2026-01-16 06:52:22.976	SYSTEM	2026-01-16 06:52:22.976	\N
23	2	RM&EM	active	2026-01-16 06:52:22.979	SYSTEM	2026-01-16 06:52:22.979	\N
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, username, password, "firstName", "lastName", "departmentId", "sectionId", email, tel, role, status, "createdAt", "createdBy", "updatedAt", "updatedBy", "lastLoginAt", "isDefaultPassword", "tokenVersion") FROM stdin;
2	test01	$2b$10$pVMH10cc8De9sTynlrcRnujdE3QF.fHVyMS9FfjabLvZ9RXUU4zyi	Test	User	19	1	test@multibax.com	0811111111	USER	active	2026-01-16 06:52:23.116	SYSTEM	2026-01-16 06:52:23.116	\N	\N	f	0
1	682732	$2b$10$BoqEuTw/adlgdaHcleYJ6.oyiGkSeIJTU/eXo3etUpySdmw50E8bi	Disakorn	Nisakuntong	23	\N	it-pro@multibax.com	0912345678	ADMIN	active	2026-01-16 06:52:22.985	SYSTEM	2026-01-21 02:47:57.675	682732	2026-01-21 02:47:57.67	f	1
\.


--
-- Data for Name: user_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_log (id, username, "firstName", "lastName", department, section, email, tel, role, status, "createdAt", "createdBy", "updatedAt", "updatedBy", "actionType", "actionAt") FROM stdin;
1	682732	Disakorn	Nisakuntong	IT		it-pro@multibax.com	0987654321	ADMIN	active	2026-01-16 06:52:22.985	SYSTEM	2026-01-16 06:52:22.985	\N	LOGIN	2026-01-16 06:53:28.917
2	682732	Disakorn	Nisakuntong	IT		it-pro@multibax.com	0987654321	ADMIN	active	2026-01-16 06:52:22.985	SYSTEM	2026-01-16 06:53:28.908	\N	LOGIN	2026-01-16 06:57:51.091
3	682732	Disakorn	Nisakuntong	IT		it-pro@multibax.com	0987654321	ADMIN	active	2026-01-16 06:52:22.985	SYSTEM	2026-01-16 06:57:51.083	\N	LOGIN	2026-01-16 07:06:13.833
4	682732	Disakorn	Nisakuntong	IT		it-pro@multibax.com	0987654321	ADMIN	active	2026-01-16 06:52:22.985	SYSTEM	2026-01-16 07:06:13.815	\N	LOGIN	2026-01-19 08:23:39.373
5	682732	Disakorn	Nisakuntong	IT		it-pro@multibax.com	0912345678	ADMIN	active	2026-01-16 06:52:22.985	SYSTEM	2026-01-19 08:31:08.571	682732	UPDATE	2026-01-19 08:31:08.585
6	682732	Disakorn	Nisakuntong	IT		it-pro@multibax.com	0912345678	ADMIN	active	2026-01-16 06:52:22.985	SYSTEM	2026-01-20 01:52:53.056	682732	LOGOUT	2026-01-20 01:52:53.175
7	682732	Disakorn	Nisakuntong	IT		it-pro@multibax.com	0912345678	ADMIN	active	2026-01-16 06:52:22.985	SYSTEM	2026-01-20 01:52:53.056	682732	LOGIN	2026-01-20 01:53:05.314
8	682732	Disakorn	Nisakuntong	IT		it-pro@multibax.com	0912345678	ADMIN	active	2026-01-16 06:52:22.985	SYSTEM	2026-01-20 01:53:05.305	682732	LOGIN	2026-01-21 02:47:57.686
\.


--
-- Name: department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.department_id_seq', 23, true);


--
-- Name: section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.section_id_seq', 23, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 2, true);


--
-- Name: user_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_log_id_seq', 8, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


--
-- Name: section section_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT section_pkey PRIMARY KEY (id);


--
-- Name: user_log user_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_log
    ADD CONSTRAINT user_log_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: department_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "department_createdAt_idx" ON public.department USING btree ("createdAt");


--
-- Name: department_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX department_name_key ON public.department USING btree (name);


--
-- Name: department_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX department_status_idx ON public.department USING btree (status);


--
-- Name: section_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "section_createdAt_idx" ON public.section USING btree ("createdAt");


--
-- Name: section_departmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "section_departmentId_idx" ON public.section USING btree ("departmentId");


--
-- Name: section_departmentId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "section_departmentId_name_key" ON public.section USING btree ("departmentId", name);


--
-- Name: section_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX section_status_idx ON public.section USING btree (status);


--
-- Name: user_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_createdAt_idx" ON public."user" USING btree ("createdAt");


--
-- Name: user_departmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_departmentId_idx" ON public."user" USING btree ("departmentId");


--
-- Name: user_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_email_idx ON public."user" USING btree (email);


--
-- Name: user_sectionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_sectionId_idx" ON public."user" USING btree ("sectionId");


--
-- Name: user_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_status_idx ON public."user" USING btree (status);


--
-- Name: user_username_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_username_idx ON public."user" USING btree (username);


--
-- Name: user_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_username_key ON public."user" USING btree (username);


--
-- Name: section section_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT "section_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.department(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user user_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "user_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.department(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user user_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "user_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public.section(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--


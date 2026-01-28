--
-- PostgreSQL database dump
--

\restrict W3FFakHFZPdmOmx5eSiEwdgHF8Q060KLQnuPEBTdm8EznM7oPzdmky51Prv7JXG

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg12+2)
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-28 21:05:29

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
-- TOC entry 6 (class 2615 OID 16398)
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: myapp_00u9_user
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO myapp_00u9_user;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: myapp_00u9_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO myapp_00u9_user;

--
-- TOC entry 870 (class 1247 OID 16400)
-- Name: accommodation_class; Type: TYPE; Schema: public; Owner: myapp_00u9_user
--

CREATE TYPE public.accommodation_class AS ENUM (
    'economy',
    'mid',
    'luxury'
);


ALTER TYPE public.accommodation_class OWNER TO myapp_00u9_user;

--
-- TOC entry 873 (class 1247 OID 16408)
-- Name: accommodation_type; Type: TYPE; Schema: public; Owner: myapp_00u9_user
--

CREATE TYPE public.accommodation_type AS ENUM (
    'فاخر',
    'متوسط',
    'اقتصادي',
    'شقق مفروشة',
    'استراحات'
);


ALTER TYPE public.accommodation_type OWNER TO myapp_00u9_user;

--
-- TOC entry 876 (class 1247 OID 16420)
-- Name: activity_category; Type: TYPE; Schema: public; Owner: myapp_00u9_user
--

CREATE TYPE public.activity_category AS ENUM (
    'مطاعم',
    'تراث',
    'طبيعة',
    'تسوق',
    'مغامرات',
    'عائلي',
    'ثقافة',
    'ترفيه'
);


ALTER TYPE public.activity_category OWNER TO myapp_00u9_user;

--
-- TOC entry 879 (class 1247 OID 16438)
-- Name: best_time; Type: TYPE; Schema: public; Owner: myapp_00u9_user
--

CREATE TYPE public.best_time AS ENUM (
    'morning',
    'afternoon',
    'evening',
    'anytime'
);


ALTER TYPE public.best_time OWNER TO myapp_00u9_user;

--
-- TOC entry 882 (class 1247 OID 16448)
-- Name: budget_level; Type: TYPE; Schema: public; Owner: myapp_00u9_user
--

CREATE TYPE public.budget_level AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.budget_level OWNER TO myapp_00u9_user;

--
-- TOC entry 885 (class 1247 OID 16456)
-- Name: item_type; Type: TYPE; Schema: public; Owner: myapp_00u9_user
--

CREATE TYPE public.item_type AS ENUM (
    'destination',
    'activity',
    'accommodation',
    'restaurant'
);


ALTER TYPE public.item_type OWNER TO myapp_00u9_user;

--
-- TOC entry 888 (class 1247 OID 16466)
-- Name: price_range; Type: TYPE; Schema: public; Owner: myapp_00u9_user
--

CREATE TYPE public.price_range AS ENUM (
    'فاخر',
    'متوسط',
    'اقتصادي'
);


ALTER TYPE public.price_range OWNER TO myapp_00u9_user;

--
-- TOC entry 891 (class 1247 OID 16474)
-- Name: role; Type: TYPE; Schema: public; Owner: myapp_00u9_user
--

CREATE TYPE public.role AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public.role OWNER TO myapp_00u9_user;

--
-- TOC entry 894 (class 1247 OID 16480)
-- Name: tier; Type: TYPE; Schema: public; Owner: myapp_00u9_user
--

CREATE TYPE public.tier AS ENUM (
    'free',
    'smart',
    'professional'
);


ALTER TYPE public.tier OWNER TO myapp_00u9_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16487)
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: myapp_00u9_user
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO myapp_00u9_user;

--
-- TOC entry 221 (class 1259 OID 16494)
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: myapp_00u9_user
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO myapp_00u9_user;

--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 221
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: myapp_00u9_user
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- TOC entry 222 (class 1259 OID 16495)
-- Name: accommodations; Type: TABLE; Schema: public; Owner: myapp_00u9_user
--

CREATE TABLE public.accommodations (
    id integer NOT NULL,
    destination_id integer NOT NULL,
    rating numeric(2,1),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    name_ar character varying(200) NOT NULL,
    name_en character varying(200),
    description_ar text,
    description_en text,
    class public.accommodation_class DEFAULT 'mid'::public.accommodation_class NOT NULL,
    google_place_id character varying(300),
    google_maps_url character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    price_range character varying(100),
    external_id character varying(100)
);


ALTER TABLE public.accommodations OWNER TO myapp_00u9_user;

--
-- TOC entry 223 (class 1259 OID 16511)
-- Name: accommodations_id_seq; Type: SEQUENCE; Schema: public; Owner: myapp_00u9_user
--

CREATE SEQUENCE public.accommodations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accommodations_id_seq OWNER TO myapp_00u9_user;

--
-- TOC entry 3530 (class 0 OID 0)
-- Dependencies: 223
-- Name: accommodations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myapp_00u9_user
--

ALTER SEQUENCE public.accommodations_id_seq OWNED BY public.accommodations.id;


--
-- TOC entry 224 (class 1259 OID 16512)
-- Name: activities; Type: TABLE; Schema: public; Owner: myapp_00u9_user
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    destination_id integer NOT NULL,
    name character varying(200) NOT NULL,
    name_en character varying(200),
    type character varying(100) NOT NULL,
    duration character varying(50),
    cost numeric(10,2) DEFAULT '0'::numeric,
    icon character varying(50),
    min_tier public.tier DEFAULT 'free'::public.tier NOT NULL,
    details text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    category public.activity_category,
    tags json,
    budget_level public.budget_level DEFAULT 'medium'::public.budget_level,
    best_time_of_day public.best_time DEFAULT 'anytime'::public.best_time,
    details_en text,
    google_maps_url character varying(500),
    external_id character varying(100)
);


ALTER TABLE public.activities OWNER TO myapp_00u9_user;

--
-- TOC entry 225 (class 1259 OID 16530)
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: myapp_00u9_user
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activities_id_seq OWNER TO myapp_00u9_user;

--
-- TOC entry 3531 (class 0 OID 0)
-- Dependencies: 225
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myapp_00u9_user
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- TOC entry 226 (class 1259 OID 16531)
-- Name: destinations; Type: TABLE; Schema: public; Owner: myapp_00u9_user
--

CREATE TABLE public.destinations (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    name_en character varying(100) NOT NULL,
    title_ar character varying(200) NOT NULL,
    title_en character varying(200) NOT NULL,
    description_ar text NOT NULL,
    description_en text NOT NULL,
    images json NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    external_id character varying(100)
);


ALTER TABLE public.destinations OWNER TO myapp_00u9_user;

--
-- TOC entry 227 (class 1259 OID 16551)
-- Name: destinations_id_seq; Type: SEQUENCE; Schema: public; Owner: myapp_00u9_user
--

CREATE SEQUENCE public.destinations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destinations_id_seq OWNER TO myapp_00u9_user;

--
-- TOC entry 3532 (class 0 OID 0)
-- Dependencies: 227
-- Name: destinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myapp_00u9_user
--

ALTER SEQUENCE public.destinations_id_seq OWNED BY public.destinations.id;


--
-- TOC entry 228 (class 1259 OID 16552)
-- Name: favorites; Type: TABLE; Schema: public; Owner: myapp_00u9_user
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    item_type public.item_type NOT NULL,
    item_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.favorites OWNER TO myapp_00u9_user;

--
-- TOC entry 229 (class 1259 OID 16561)
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: myapp_00u9_user
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorites_id_seq OWNER TO myapp_00u9_user;

--
-- TOC entry 3533 (class 0 OID 0)
-- Dependencies: 229
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myapp_00u9_user
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- TOC entry 230 (class 1259 OID 16562)
-- Name: restaurants; Type: TABLE; Schema: public; Owner: myapp_00u9_user
--

CREATE TABLE public.restaurants (
    id integer NOT NULL,
    destination_id integer NOT NULL,
    name character varying(200) NOT NULL,
    cuisine character varying(100) NOT NULL,
    price_range public.price_range NOT NULL,
    avg_price numeric(10,2) NOT NULL,
    rating numeric(2,1),
    specialties json,
    trending character varying(200),
    location character varying(200),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.restaurants OWNER TO myapp_00u9_user;

--
-- TOC entry 231 (class 1259 OID 16575)
-- Name: restaurants_id_seq; Type: SEQUENCE; Schema: public; Owner: myapp_00u9_user
--

CREATE SEQUENCE public.restaurants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurants_id_seq OWNER TO myapp_00u9_user;

--
-- TOC entry 3534 (class 0 OID 0)
-- Dependencies: 231
-- Name: restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myapp_00u9_user
--

ALTER SEQUENCE public.restaurants_id_seq OWNED BY public.restaurants.id;


--
-- TOC entry 232 (class 1259 OID 16576)
-- Name: support_messages; Type: TABLE; Schema: public; Owner: myapp_00u9_user
--

CREATE TABLE public.support_messages (
    id integer NOT NULL,
    user_id integer,
    name character varying(100) NOT NULL,
    email character varying(320) NOT NULL,
    subject character varying(200) NOT NULL,
    message text NOT NULL,
    is_resolved boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.support_messages OWNER TO myapp_00u9_user;

--
-- TOC entry 233 (class 1259 OID 16590)
-- Name: support_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: myapp_00u9_user
--

CREATE SEQUENCE public.support_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.support_messages_id_seq OWNER TO myapp_00u9_user;

--
-- TOC entry 3535 (class 0 OID 0)
-- Dependencies: 233
-- Name: support_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myapp_00u9_user
--

ALTER SEQUENCE public.support_messages_id_seq OWNED BY public.support_messages.id;


--
-- TOC entry 234 (class 1259 OID 16591)
-- Name: trips; Type: TABLE; Schema: public; Owner: myapp_00u9_user
--

CREATE TABLE public.trips (
    id integer NOT NULL,
    user_id integer NOT NULL,
    destination_id integer NOT NULL,
    days integer NOT NULL,
    budget numeric(10,2) NOT NULL,
    interests json NOT NULL,
    accommodation_type character varying(50),
    plan json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    share_token character varying(64),
    is_public boolean DEFAULT false NOT NULL
);


ALTER TABLE public.trips OWNER TO myapp_00u9_user;

--
-- TOC entry 235 (class 1259 OID 16608)
-- Name: trips_id_seq; Type: SEQUENCE; Schema: public; Owner: myapp_00u9_user
--

CREATE SEQUENCE public.trips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trips_id_seq OWNER TO myapp_00u9_user;

--
-- TOC entry 3536 (class 0 OID 0)
-- Dependencies: 235
-- Name: trips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myapp_00u9_user
--

ALTER SEQUENCE public.trips_id_seq OWNED BY public.trips.id;


--
-- TOC entry 236 (class 1259 OID 16609)
-- Name: users; Type: TABLE; Schema: public; Owner: myapp_00u9_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(320) NOT NULL,
    password character varying(255) NOT NULL,
    role public.role DEFAULT 'user'::public.role NOT NULL,
    tier public.tier DEFAULT 'free'::public.tier NOT NULL,
    phone character varying(20),
    city character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    last_signed_in timestamp without time zone DEFAULT now() NOT NULL,
    full_name text
);


ALTER TABLE public.users OWNER TO myapp_00u9_user;

--
-- TOC entry 237 (class 1259 OID 16628)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: myapp_00u9_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO myapp_00u9_user;

--
-- TOC entry 3537 (class 0 OID 0)
-- Dependencies: 237
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myapp_00u9_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3297 (class 2604 OID 16629)
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: myapp_00u9_user
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- TOC entry 3298 (class 2604 OID 16630)
-- Name: accommodations id; Type: DEFAULT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.accommodations ALTER COLUMN id SET DEFAULT nextval('public.accommodations_id_seq'::regclass);


--
-- TOC entry 3303 (class 2604 OID 16631)
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- TOC entry 3310 (class 2604 OID 16632)
-- Name: destinations id; Type: DEFAULT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.destinations ALTER COLUMN id SET DEFAULT nextval('public.destinations_id_seq'::regclass);


--
-- TOC entry 3314 (class 2604 OID 16633)
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- TOC entry 3316 (class 2604 OID 16634)
-- Name: restaurants id; Type: DEFAULT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.restaurants ALTER COLUMN id SET DEFAULT nextval('public.restaurants_id_seq'::regclass);


--
-- TOC entry 3318 (class 2604 OID 16635)
-- Name: support_messages id; Type: DEFAULT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.support_messages ALTER COLUMN id SET DEFAULT nextval('public.support_messages_id_seq'::regclass);


--
-- TOC entry 3321 (class 2604 OID 16636)
-- Name: trips id; Type: DEFAULT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.trips ALTER COLUMN id SET DEFAULT nextval('public.trips_id_seq'::regclass);


--
-- TOC entry 3325 (class 2604 OID 16637)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3506 (class 0 OID 16487)
-- Dependencies: 220
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: myapp_00u9_user
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	32eda1db6c1c18729f2d180210956e58f25034135aea821dc05465361d20e7d0	1768526677532
2	5a88a263e78f1a1cac2e1adff8a5de0c302f03336d030b38292a34147652da4a	1768585901357
\.


--
-- TOC entry 3508 (class 0 OID 16495)
-- Dependencies: 222
-- Data for Name: accommodations; Type: TABLE DATA; Schema: public; Owner: myapp_00u9_user
--

COPY public.accommodations (id, destination_id, rating, created_at, name_ar, name_en, description_ar, description_en, class, google_place_id, google_maps_url, is_active, updated_at, price_range, external_id) FROM stdin;
97	1	\N	2026-01-26 18:17:10.824737	فندق إيبيس الرياض	Ibis Riyadh	\N	\N	economy	\N	https://www.google.com/maps/search/?api=1&query=ibis+riyadh	t	2026-01-26 18:17:10.824737	300-350	accommodation_1769451430685_0
98	1	\N	2026-01-26 18:17:11.134961	فندق التنفيذيين	Executives Hotel	\N	\N	mid	\N	https://www.google.com/maps/search/?api=1&query=executives+hotel+riyadh	t	2026-01-26 18:17:11.134961	550-650	accommodation_1769451430993_1
99	1	\N	2026-01-26 18:17:11.43287	فندق الفورسيزونز الرياض	Four Seasons Riyadh	\N	\N	luxury	\N	https://www.google.com/maps/search/?api=1&query=four+seasons+riyadh	t	2026-01-26 18:17:11.43287	1200-1600	accommodation_1769451431256_2
100	1	\N	2026-01-26 18:35:07.719317	فندق إيبيس الرياض	Ibis Riyadh	\N	\N	economy	\N	https://www.google.com/maps/search/?api=1&query=ibis+riyadh	t	2026-01-26 18:35:07.719317	300-350	accommodation_1769452507588_0
101	1	\N	2026-01-26 18:35:07.966817	فندق التنفيذيين	Executives Hotel	\N	\N	mid	\N	https://www.google.com/maps/search/?api=1&query=executives+hotel+riyadh	t	2026-01-26 18:35:07.966817	550-650	accommodation_1769452507836_1
102	1	\N	2026-01-26 18:35:08.205548	فندق نوفوتيل العليا	Novotel Olaya	\N	\N	mid	\N	https://www.google.com/maps/search/?api=1&query=novotel+olaya	t	2026-01-26 18:35:08.205548	600-750	accommodation_1769452508075_2
103	1	\N	2026-01-26 18:35:08.445691	فندق الفورسيزونز الرياض	Four Seasons Riyadh	\N	\N	luxury	\N	https://www.google.com/maps/search/?api=1&query=four+seasons+riyadh	t	2026-01-26 18:35:08.445691	1200-1600	accommodation_1769452508315_3
\.


--
-- TOC entry 3510 (class 0 OID 16512)
-- Dependencies: 224
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: myapp_00u9_user
--

COPY public.activities (id, destination_id, name, name_en, type, duration, cost, icon, min_tier, details, is_active, created_at, category, tags, budget_level, best_time_of_day, details_en, google_maps_url, external_id) FROM stdin;
548	1	قصر المصمك	Masmak Fort	attraction	90	0.00	\N	free	\N	t	2026-01-26 18:17:06.866022	تراث	["تراث"]	low	morning	\N	\N	activity_1769451426728_0
549	1	المتحف الوطني السعودي	National Museum	museum	120	0.00	\N	free	\N	t	2026-01-26 18:17:07.110552	ثقافة	["ثقافة"]	low	morning	\N	\N	activity_1769451426975_1
550	1	متحف النقد	SAMA Museum	museum	60	0.00	\N	smart	\N	t	2026-01-26 18:17:07.351092	تراث	["تراث"]	low	afternoon	\N	\N	activity_1769451427215_2
551	1	حديقة السلام	Salam Park	park	120	0.00	\N	free	\N	t	2026-01-26 18:17:07.598428	طبيعة	["طبيعة"]	low	afternoon	\N	\N	activity_1769451427460_3
552	1	وادي نمار	Wadi Namar	park	120	0.00	\N	free	\N	t	2026-01-26 18:17:07.840879	طبيعة	["طبيعة"]	low	afternoon	\N	\N	activity_1769451427702_4
553	1	منتزه الثمامة للحياة الفطرية	Thumamah Wildlife Park	park	150	0.00	\N	free	\N	t	2026-01-26 18:17:08.083514	طبيعة	["طبيعة"]	low	afternoon	\N	\N	activity_1769451427946_5
554	1	النخيل مول	Nakheel Mall	mall	120	0.00	\N	smart	\N	t	2026-01-26 18:17:08.32608	تسوق	["تسوق"]	medium	evening	\N	\N	activity_1769451428189_6
555	1	بوليفارد رياض سيتي	Boulevard Riyadh City	attraction	120	0.00	\N	smart	\N	t	2026-01-26 18:17:08.567775	ترفيه	["ترفيه"]	medium	evening	\N	\N	activity_1769451428432_7
556	1	واجهة الرياض	Riyadh Front	attraction	120	0.00	\N	smart	\N	t	2026-01-26 18:17:08.808128	ترفيه	["ترفيه"]	medium	evening	\N	\N	activity_1769451428673_8
557	1	مقهى كافد (فطور)	KAFD Cafe (Breakfast)	restaurant	60	0.00	\N	free	\N	t	2026-01-26 18:17:09.048907	مطاعم	["مطاعم"]	low	morning	\N	\N	activity_1769451428913_9
558	1	مطعم القرية النجدية	Najd Village Restaurant	restaurant	90	0.00	\N	smart	\N	t	2026-01-26 18:17:09.290702	مطاعم	["مطاعم"]	medium	afternoon	\N	\N	activity_1769451429155_10
559	1	مطعم توينا	Twina Seafood Restaurant	restaurant	90	0.00	\N	smart	\N	t	2026-01-26 18:17:09.533898	مطاعم	["مطاعم"]	medium	afternoon	\N	\N	activity_1769451429398_11
560	1	مطعم زعفران	Zaafaran Restaurant	restaurant	90	0.00	\N	professional	\N	t	2026-01-26 18:17:09.781493	مطاعم	["مطاعم"]	high	evening	\N	\N	activity_1769451429646_12
561	1	مطعم لوسين	Lusin Restaurant	restaurant	90	0.00	\N	professional	\N	t	2026-01-26 18:17:10.037165	مطاعم	["مطاعم"]	high	evening	\N	\N	activity_1769451429887_13
562	1	كافيه مختص (سناك)	Specialty Cafe (Snack)	restaurant	45	0.00	\N	free	\N	t	2026-01-26 18:17:10.334634	مطاعم	["مطاعم"]	low	evening	\N	\N	activity_1769451430146_14
563	1	حلويات ومقهى (سناك)	Dessert & Coffee (Snack)	restaurant	45	0.00	\N	free	\N	t	2026-01-26 18:17:10.580324	مطاعم	["مطاعم"]	low	evening	\N	\N	activity_1769451430444_15
564	1	قصر المصمك	Masmak Fort	attraction	90	0.00	\N	free	\N	t	2026-01-26 18:35:02.875869	تراث	["تراث"]	low	morning	\N	\N	activity_1769452502739_0
565	1	المتحف الوطني السعودي	National Museum of Saudi Arabia	museum	120	0.00	\N	free	\N	t	2026-01-26 18:35:03.119339	ثقافة	["ثقافة"]	low	morning	\N	\N	activity_1769452502985_1
566	1	مركز الملك عبدالعزيز التاريخي	King Abdulaziz Historical Center	attraction	120	0.00	\N	free	\N	t	2026-01-26 18:35:03.365718	ثقافة	["ثقافة"]	low	morning	\N	\N	activity_1769452503236_2
567	1	وادي نمار	Wadi Namar	park	120	0.00	\N	free	\N	t	2026-01-26 18:35:03.609084	طبيعة	["طبيعة"]	low	afternoon	\N	\N	activity_1769452503474_3
568	1	حديقة السلام	Al Salam Park	park	120	0.00	\N	free	\N	t	2026-01-26 18:35:03.847674	طبيعة	["طبيعة"]	low	afternoon	\N	\N	activity_1769452503717_4
569	1	منتزه الثمامة للحياة الفطرية	Thumamah Wildlife Park	park	150	0.00	\N	free	\N	t	2026-01-26 18:35:04.085739	طبيعة	["طبيعة"]	low	afternoon	\N	\N	activity_1769452503955_5
570	1	بوليفارد رياض سيتي	Boulevard Riyadh City	attraction	120	0.00	\N	smart	\N	t	2026-01-26 18:35:04.326853	ترفيه	["ترفيه"]	medium	evening	\N	\N	activity_1769452504195_6
571	1	واجهة الرياض	Riyadh Front	attraction	120	0.00	\N	smart	\N	t	2026-01-26 18:35:04.564829	ترفيه	["ترفيه"]	medium	evening	\N	\N	activity_1769452504435_7
572	1	النخيل مول	Nakheel Mall	mall	120	0.00	\N	smart	\N	t	2026-01-26 18:35:04.818693	تسوق	["تسوق"]	medium	evening	\N	\N	activity_1769452504688_8
573	1	الرياض بارك	Riyadh Park Mall	mall	120	0.00	\N	smart	\N	t	2026-01-26 18:35:05.059214	تسوق	["تسوق"]	medium	evening	\N	\N	activity_1769452504927_9
574	1	مقهى كافد	KAFD Cafe	restaurant	60	0.00	\N	free	\N	t	2026-01-26 18:35:05.301692	مطاعم	["مطاعم"]	low	morning	\N	\N	activity_1769452505168_10
575	1	مخبز بول	PAUL Bakery	restaurant	60	0.00	\N	smart	\N	t	2026-01-26 18:35:05.545322	مطاعم	["مطاعم"]	medium	morning	\N	\N	activity_1769452505412_11
576	1	مطعم القرية النجدية	Najd Village Restaurant	restaurant	90	0.00	\N	smart	\N	t	2026-01-26 18:35:05.783691	مطاعم	["مطاعم"]	medium	afternoon	\N	\N	activity_1769452505654_12
577	1	مطعم توينا	Twina Seafood Restaurant	restaurant	90	0.00	\N	smart	\N	t	2026-01-26 18:35:06.022747	مطاعم	["مطاعم"]	medium	afternoon	\N	\N	activity_1769452505892_13
578	1	مطعم أزال	Azal Restaurant	restaurant	90	0.00	\N	smart	\N	t	2026-01-26 18:35:06.261989	مطاعم	["مطاعم"]	medium	afternoon	\N	\N	activity_1769452506131_14
579	1	مطعم زعفران	Zaafaran Restaurant	restaurant	90	0.00	\N	professional	\N	t	2026-01-26 18:35:06.499554	مطاعم	["مطاعم"]	high	evening	\N	\N	activity_1769452506369_15
580	1	مطعم لوسين	Lusin Restaurant	restaurant	90	0.00	\N	professional	\N	t	2026-01-26 18:35:06.738204	مطاعم	["مطاعم"]	high	evening	\N	\N	activity_1769452506607_16
581	1	مطعم سهيل	Suhail Restaurant	restaurant	90	0.00	\N	smart	\N	t	2026-01-26 18:35:06.998159	مطاعم	["مطاعم"]	medium	evening	\N	\N	activity_1769452506848_17
582	1	كافيه مختص	Specialty Cafe	restaurant	45	0.00	\N	free	\N	t	2026-01-26 18:35:07.236927	مطاعم	["مطاعم"]	low	anytime	\N	\N	activity_1769452507107_18
583	1	حلويات باتشي	Patchi Desserts	restaurant	45	0.00	\N	free	\N	t	2026-01-26 18:35:07.476344	مطاعم	["مطاعم"]	medium	evening	\N	\N	activity_1769452507346_19
\.


--
-- TOC entry 3512 (class 0 OID 16531)
-- Dependencies: 226
-- Data for Name: destinations; Type: TABLE DATA; Schema: public; Owner: myapp_00u9_user
--

COPY public.destinations (id, slug, name_ar, name_en, title_ar, title_en, description_ar, description_en, images, is_active, created_at, updated_at, external_id) FROM stdin;
4	abha	أبها	Abha	سيدة الضباب	Lady of the Fog	مدينة جبلية باردة بطبيعة خلابة ومناظر ساحرة في قلب عسير	A cool mountain city with stunning nature and charming views in the heart of Asir	["/images/cities/abha-hero.jpg"]	t	2026-01-16 04:03:45.786897	2026-01-16 04:03:45.786897	abha
6	taif	الطائف	Taif	مصيف العرب	Summer Resort of Arabia	مدينة الورد والفواكه في أعالي جبال الحجاز	City of roses and fruits in the highlands of Hijaz	["\\/images\\/cities\\/taif-hero.jpg"]	t	2026-01-16 04:04:58.518833	2026-01-16 04:04:58.518833	taif
3	alula	العلا	AlUla	متحف في الهواء الطلق	An Open-Air Museum	واحة تاريخية بين الصخور الضخمة وآثار الحضارات القديمة	A historical oasis among massive rocks and ancient civilization ruins	["/images/cities/alula-hero.png"]	t	2026-01-16 04:03:45.786897	2026-01-16 04:03:45.786897	alula
2	jeddah	جدة	Jeddah	عروس البحر الأحمر	Bride of the Red Sea	جدة بوابة الحرمين، تشتهر بكورنيشها الساحر ومنطقة البلد التاريخية، وتعد مركزاً للثقافة والفنون.	A historic coastal city blending civilization and sea with a stunning corniche and traditional markets	["https://images.unsplash.com/photo-1551041777-ed3104674696?q=80&w=1000"]	t	2026-01-16 04:03:45.786897	2026-01-16 04:03:45.786897	jeddah
1	riyadh	الرياض	Riyadh	الرياض	Riyadh	مدينة تجمع بين التراث النجدي العريق والمشاريع الترفيهية الحديثة والمطاعم العالمية.	A city blending Najdi heritage, modern entertainment, and diverse dining experiences.	["https://example.com/riyadh.jpg"]	t	2026-01-16 04:03:45.786897	2026-01-26 18:35:02.622024	riyadh
\.


--
-- TOC entry 3514 (class 0 OID 16552)
-- Dependencies: 228
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: myapp_00u9_user
--

COPY public.favorites (id, user_id, item_type, item_id, created_at) FROM stdin;
\.


--
-- TOC entry 3516 (class 0 OID 16562)
-- Dependencies: 230
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: myapp_00u9_user
--

COPY public.restaurants (id, destination_id, name, cuisine, price_range, avg_price, rating, specialties, trending, location, created_at) FROM stdin;
\.


--
-- TOC entry 3518 (class 0 OID 16576)
-- Dependencies: 232
-- Data for Name: support_messages; Type: TABLE DATA; Schema: public; Owner: myapp_00u9_user
--

COPY public.support_messages (id, user_id, name, email, subject, message, is_resolved, created_at) FROM stdin;
\.


--
-- TOC entry 3520 (class 0 OID 16591)
-- Dependencies: 234
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: myapp_00u9_user
--

COPY public.trips (id, user_id, destination_id, days, budget, interests, accommodation_type, plan, created_at, updated_at, share_token, is_public) FROM stdin;
10	3	1	5	5000.00	["تسوق وترفيه","ثقافة وتراث"]	فاخر	{"destination":"الرياض","days":5,"budget":5000,"budgetDistribution":{"accommodation":400,"activities":350,"food":250},"qualityLevel":"عالية","accommodation":{"name":"فندق فورسيزونز الرياض","nameEn":"Four Seasons Hotel Riyadh at Kingdom Centre","class":"luxury","priceRange":"1200–2500","googleMapsUrl":"https://www.google.com/maps/place/?q=place_id:null","rating":null},"noAccommodationMessage":null,"dailyPlan":[{"day":1,"title":"اليوم الأول","activities":[{"time":"09:00","period":"صباحًا","activity":"حافة العالم","description":"رحلة طبيعية خارج الرياض للمناظر والتصوير (تحتاج وقت وتجهيز). — السعر التقريبي: 100–300 ر.س للشخص","type":"مغامرات","category":"مغامرات","duration":"360 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"12:00","period":"ظهرًا","activity":"مسجد الشيخ محمد بن إبراهيم","description":"مسجد معروف؛ زيارة سريعة مناسبة للتعرف على المعلم والتصوير الخارجي. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"30 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"15:00","period":"عصرًا","activity":"واحة الملك سلمان للعلوم","description":"وجهة تعليمية تفاعلية للأطفال والعائلات. — السعر التقريبي: 50–150 ر.س للشخص","type":"عائلي","category":"عائلي","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"18:00","period":"مساءً","activity":"القصر مول","description":"مول كبير للتسوق والترفيه. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"09:00","period":"صباحًا","activity":"قصر المصمك","description":"قلعة تاريخية في قلب الرياض، من أهم معالم المدينة. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"75 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"12:00","period":"ظهرًا","activity":"حديقة الحيوان بالرياض","description":"وجهة عائلية مع حيوانات متنوعة، مناسبة لعصر ممتع. — السعر التقريبي: 50–150 ر.س للشخص","type":"عائلي","category":"عائلي","duration":"180 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"15:00","period":"عصرًا","activity":"متحف النقد","description":"متحف متخصص بتاريخ العملات والأنظمة النقدية. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"60 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"18:00","period":"مساءً","activity":"حديقة الملك عبدالله","description":"حديقة شهيرة للمشي والجلوس والنوافير. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"120 دقيقة","cost":"0.00","budgetLevel":"low"}]},{"day":2,"title":"اليوم الثاني","activities":[{"time":"09:00","period":"صباحًا","activity":"قصر المربع","description":"قصر تاريخي يعكس الطراز النجدي، زيارة داخلية. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"60 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"12:00","period":"ظهرًا","activity":"جامع كافد الكبير","description":"جامع حديث داخل منطقة كافد. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"45 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"15:00","period":"عصرًا","activity":"برج مصرف الراجحي","description":"معلم حضري معروف مناسب للتصوير الخارجي وجولة سريعة في المنطقة المحيطة. — السعر التقريبي: 0–50 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"30 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"18:00","period":"مساءً","activity":"مدينة الملك فهد الرياضية","description":"مجمع رياضي كبير ومكان لمباريات وفعاليات. — السعر التقريبي: 50–150 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"180 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"09:00","period":"صباحًا","activity":"متحف القوات الجوية الملكية السعودية","description":"متحف طيران مناسب لمحبي المعروضات العسكرية. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"12:00","period":"ظهرًا","activity":"سوق المعيقلية","description":"سوق/مركز معروف للتسوق في وسط الرياض. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"15:00","period":"عصرًا","activity":"برج النخيل","description":"معلم حضري معروف مناسب للتصوير الخارجي وجولة سريعة في المنطقة المحيطة. — السعر التقريبي: 0–50 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"30 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"18:00","period":"مساءً","activity":"وادي نمار","description":"وادي مع بحيرة وممشى، مناسب للمساء. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"120 دقيقة","cost":"0.00","budgetLevel":"low"}]},{"day":3,"title":"اليوم الثالث","activities":[{"time":"09:00","period":"صباحًا","activity":"إيرث كافيه","description":"كافيه ومطعم صحي مشهور بالفطور. — السعر التقريبي: 60–120 ر.س","type":"مطاعم","category":"مطاعم","duration":"75 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"12:00","period":"ظهرًا","activity":"مسجد الملك عبدالله (برج المملكة)","description":"مسجد داخل مجمع برج المملكة. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"30 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"15:00","period":"عصرًا","activity":"أبراج العليا","description":"معلم حضري معروف مناسب للتصوير الخارجي وجولة سريعة في المنطقة المحيطة. — السعر التقريبي: 0–50 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"30 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"18:00","period":"مساءً","activity":"كينغدوم أرينا","description":"قاعة/ساحة فعاليات كبرى في الرياض (حسب الفعاليات). — السعر التقريبي: 150–400 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"150 دقيقة","cost":"0.00","budgetLevel":"high"},{"time":"09:00","period":"صباحًا","activity":"بول","description":"مطعم ومخبز فرنسي مناسب للفطور والغداء. — السعر التقريبي: 60–120 ر.س","type":"مطاعم","category":"مطاعم","duration":"75 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"12:00","period":"ظهرًا","activity":"مركز تجارة السويقة","description":"منطقة تجارية في وسط الرياض لشراء منتجات متنوعة. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"75 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"15:00","period":"عصرًا","activity":"برج تلفزيون الرياض","description":"معلم بارز يمكن زيارته من الخارج للتصوير. — السعر التقريبي: 0–50 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"30 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"18:00","period":"مساءً","activity":"بحيرات الحائر","description":"منتزه بحيرات للتنزه العائلي خارج المركز. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"150 دقيقة","cost":"0.00","budgetLevel":"low"}]},{"day":4,"title":"اليوم الرابع","activities":[{"time":"09:00","period":"صباحًا","activity":"مكتبة الملك عبدالعزيز العامة","description":"مكتبة عامة ومكان هادئ للقراءة والاطلاع. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"75 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"12:00","period":"ظهرًا","activity":"مسجد السلام","description":"مسجد في الرياض مناسب لزيارة قصيرة. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"30 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"15:00","period":"عصرًا","activity":"معرض نايلة للفنون","description":"وجهة ثقافية داخلية مناسبة لزيارة نهارية أو عصرًا. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"18:00","period":"مساءً","activity":"حديقة الواحة","description":"حديقة مفتوحة مناسبة للمشي والسكوترات. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"09:00","period":"صباحًا","activity":"جبل طويق","description":"وجهة طبيعية للمناظر والتصوير خارج المدينة. — السعر التقريبي: 100–300 ر.س للشخص","type":"مغامرات","category":"مغامرات","duration":"240 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"12:00","period":"ظهرًا","activity":"مبنى وزارة الداخلية","description":"معلم حضري معروف مناسب للتصوير الخارجي وجولة سريعة في المنطقة المحيطة. — السعر التقريبي: 0–50 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"30 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"15:00","period":"عصرًا","activity":"جامع الراجحي","description":"من أكبر المساجد في الرياض، مناسب لزيارة قصيرة. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"45 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"18:00","period":"مساءً","activity":"ذا فيو مول","description":"مول للتسوق وقضاء وقت داخل المدينة. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium"}]},{"day":5,"title":"اليوم الخامس","activities":[{"time":"09:00","period":"صباحًا","activity":"كهف هيت","description":"وجهة كهف خارج الرياض مناسبة لمحبي الاستكشاف. — السعر التقريبي: 100–300 ر.س للشخص","type":"مغامرات","category":"مغامرات","duration":"240 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"12:00","period":"ظهرًا","activity":"قصر طويق","description":"معلم معماري في الحي الدبلوماسي (حسب الإتاحة). — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"45 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"15:00","period":"عصرًا","activity":"حديقة المتحف الوطني","description":"مساحات خارجية حول منطقة المتحف مناسبة لزيارة قصيرة. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"60 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"18:00","period":"مساءً","activity":"مركز الملك عبدالله المالي (كافد)","description":"منطقة حديثة للمشي والتصوير مع مقاهٍ ومطاعم. — السعر التقريبي: 50–150 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"90 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"09:00","period":"صباحًا","activity":"إميرغان سوتيس","description":"مطعم تركي مشهور بالفطور والأطباق التقليدية. — السعر التقريبي: 70–140 ر.س","type":"مطاعم","category":"مطاعم","duration":"90 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"12:00","period":"ظهرًا","activity":"مسجد المادي","description":"مسجد معروف؛ زيارة سريعة مناسبة للتعرف على المعلم. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"30 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"15:00","period":"عصرًا","activity":"قصر البديعة","description":"معلم تراثي في الرياض مناسب للزيارة القصيرة والتصوير. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"45 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"18:00","period":"مساءً","activity":"ملعب مدينة الأمير فيصل بن فهد الرياضية","description":"ملعب رياضي في الرياض يستضيف مباريات وفعاليات. — السعر التقريبي: 50–150 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"180 دقيقة","cost":"0.00","budgetLevel":"medium"}]}]}	2026-01-19 14:15:27.538438	2026-01-19 14:15:27.538438	\N	f
43	1	1	3	500.00	["ثقافة وتراث"]	فاخر	{"destination":"الرياض","days":3,"budget":500,"budgetDistribution":{"accommodation":66.66666666666667,"activities":58.33333333333333,"food":41.666666666666664},"qualityLevel":"اقتصادية","accommodation":null,"accommodationSelectionNote":null,"noAccommodationMessage":"لا توجد إقامات تناسب ميزانيتك في هذه المدينة","dailyBudget":166.66666666666666,"accommodationCostPerNight":0,"remainingAfterAccommodation":166.66666666666666,"budgetNote":null,"budgetActivityNote":null,"dailyPlan":[{"day":1,"title":"اليوم الأول","activities":[{"startTime":"09:00","endTime":"11:30","period":"صباحًا","activity":"مركز الرياض فرونت للمعارض والمؤتمرات","description":"مركز معارض ومؤتمرات كبير يستضيف فعاليات ومعارض مختلفة على مدار السنة. — السعر التقريبي: 50–150 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"150 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":60},{"startTime":"12:00","endTime":"14:00","period":"ظهرًا","activity":"النخيل مول","description":"مول مناسب للعائلات والتسوق والترفيه. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":100}],"dayTotalCost":160,"dayBudgetSummary":{"dailyBudget":166.66666666666666,"accommodationCostPerNight":0,"remainingAfterAccommodation":166.66666666666666,"activitiesCost":160,"remainingAfterActivities":6.666666666666657},"remainingTripBudget":340},{"day":2,"title":"اليوم الثاني","activities":[{"startTime":"09:00","endTime":"12:00","period":"صباحًا","activity":"حديقة الحيوان بالرياض","description":"وجهة عائلية مع حيوانات متنوعة، مناسبة لعصر ممتع. — السعر التقريبي: 50–150 ر.س للشخص","type":"عائلي","category":"عائلي","duration":"180 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":50},{"startTime":"12:30","endTime":"14:30","period":"ظهرًا","activity":"حديقة السلام","description":"حديقة واسعة مع بحيرة ومناطق لعب للأطفال. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"120 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"15:00","endTime":"17:30","period":"ظهرًا","activity":"منتزه الثمامة للحياة الفطرية","description":"منتزه واسع خارج المركز للتنزه والهواء الطلق. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"150 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"18:00","endTime":"18:45","period":"مساءً","activity":"قصر طويق","description":"معلم معماري في الحي الدبلوماسي (حسب الإتاحة). — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"45 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"19:15","endTime":"21:45","period":"مساءً","activity":"محمد عبده أرينا","description":"ساحة فعاليات وعروض موسمية (حسب الفعاليات). — السعر التقريبي: 150–400 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"150 دقيقة","cost":"0.00","budgetLevel":"high","estimatedCost":60}],"dayTotalCost":150,"dayBudgetSummary":{"dailyBudget":166.66666666666666,"accommodationCostPerNight":0,"remainingAfterAccommodation":166.66666666666666,"activitiesCost":150,"remainingAfterActivities":16.666666666666657},"remainingTripBudget":190},{"day":3,"title":"اليوم الثالث","activities":[{"startTime":"09:00","endTime":"10:00","period":"صباحًا","activity":"جبل أبو مخروق","description":"مكان مناسب للمشي الخفيف أو التوقف للتصوير حسب الموقع. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"60 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"10:30","endTime":"12:00","period":"صباحًا","activity":"حديقة السويدي","description":"حديقة عامة مناسبة للمشي والجلوس. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"12:30","endTime":"13:00","period":"ظهرًا","activity":"مسجد الأميرة لطيفة بنت سلطان","description":"مسجد معروف؛ زيارة سريعة مناسبة للتعرف على المعلم والتصوير الخارجي. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"30 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"13:30","endTime":"15:00","period":"ظهرًا","activity":"مركز الملك عبدالله المالي (كافد)","description":"منطقة حديثة للمشي والتصوير مع مقاهٍ ومطاعم. — السعر التقريبي: 50–150 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"90 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":60},{"startTime":"15:30","endTime":"16:30","period":"ظهرًا","activity":"مكتبة الملك فهد الوطنية","description":"مكتبة وطنية ومعارض داخلية هادئة. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"60 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"17:00","endTime":"18:00","period":"مساءً","activity":"متحف النقد","description":"متحف متخصص بتاريخ العملات والأنظمة النقدية. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"60 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"18:30","endTime":"19:15","period":"مساءً","activity":"قصر البديعة","description":"معلم تراثي في الرياض مناسب للزيارة القصيرة والتصوير. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"45 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20}],"dayTotalCost":160,"dayBudgetSummary":{"dailyBudget":166.66666666666666,"accommodationCostPerNight":0,"remainingAfterAccommodation":166.66666666666666,"activitiesCost":160,"remainingAfterActivities":6.666666666666657},"remainingTripBudget":30}],"tripTotalCost":470,"remainingBudget":30}	2026-01-25 13:06:16.060911	2026-01-25 13:06:16.060911	\N	f
42	1	1	3	6000.00	["ثقافة وتراث","طعام ومطاعم"]	متوسط	{"destination":"الرياض","days":3,"budget":6000,"budgetDistribution":{"accommodation":800,"activities":700,"food":500},"qualityLevel":"عالية","accommodation":{"name":"هيلتون الرياض","nameEn":"Hilton Riyadh Hotel & Residences","class":"mid","priceRange":"700–1200","googleMapsUrl":"https://www.google.com/maps/place/?q=place_id:null","rating":null},"accommodationSelectionNote":null,"noAccommodationMessage":null,"dailyBudget":2000,"accommodationCostPerNight":700,"remainingAfterAccommodation":1300,"budgetNote":null,"budgetActivityNote":null,"dailyPlan":[{"day":1,"title":"اليوم الأول","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"متحف الفيصل للفن العربي الإسلامي","description":"وجهة ثقافية داخلية مناسبة لزيارة نهارية أو عصرًا. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"11:00","endTime":"12:15","period":"صباحًا","activity":"سوق الزل","description":"سوق تقليدي للمنتجات التراثية والهدايا. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"75 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":100},{"startTime":"12:45","endTime":"14:15","period":"ظهرًا","activity":"برج المملكة","description":"معلم أيقوني مع تسوق ومطاعم وإطلالة (سكاي بريدج). — السعر التقريبي: 150–400 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"90 دقيقة","cost":"0.00","budgetLevel":"high","estimatedCost":60},{"startTime":"14:45","endTime":"16:45","period":"ظهرًا","activity":"بانوراما مول","description":"مول للتسوق مع مقاهٍ ومطاعم. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":100},{"startTime":"17:15","endTime":"18:00","period":"مساءً","activity":"جامع كافد الكبير","description":"جامع حديث داخل منطقة كافد. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"45 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"18:30","endTime":"19:30","period":"مساءً","activity":"قصر المربع","description":"قصر تاريخي يعكس الطراز النجدي، زيارة داخلية. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"60 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"20:00","endTime":"22:00","period":"مساءً","activity":"حديقة الملك عبدالله","description":"حديقة شهيرة للمشي والجلوس والنوافير. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"120 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":10}],"dayTotalCost":330,"dayBudgetSummary":{"dailyBudget":2000,"accommodationCostPerNight":700,"remainingAfterAccommodation":1300,"activitiesCost":330,"remainingAfterActivities":970},"remainingTripBudget":4970},{"day":2,"title":"اليوم الثاني","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"منتزه تراث البجيري","description":"حديقة في الدرعية بإطلالة على حي الطريف. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"11:00","endTime":"13:00","period":"صباحًا","activity":"يو ووك","description":"وجهة مفتوحة تضم مطاعم ومقاهي وممشى. — السعر التقريبي: 50–150 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":60},{"startTime":"13:30","endTime":"15:00","period":"ظهرًا","activity":"حديقة الواحة","description":"حديقة مفتوحة مناسبة للمشي والسكوترات. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"15:30","endTime":"16:15","period":"ظهرًا","activity":"برج رافال","description":"برج مرتفع ومعلم معروف (تجربة خارجية للتصوير أو زيارة مرافقه). — السعر التقريبي: 0–50 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"45 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":60},{"startTime":"16:45","endTime":"19:15","period":"مساءً","activity":"كينغدوم أرينا","description":"قاعة/ساحة فعاليات كبرى في الرياض (حسب الفعاليات). — السعر التقريبي: 150–400 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"150 دقيقة","cost":"0.00","budgetLevel":"high","estimatedCost":60},{"startTime":"19:45","endTime":"21:45","period":"مساءً","activity":"حديقة السلام","description":"حديقة واسعة مع بحيرة ومناطق لعب للأطفال. — السعر التقريبي: 0–10 ر.س (غالبًا مجاني أو برسوم رمزية)","type":"طبيعة","category":"طبيعة","duration":"120 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":10}],"dayTotalCost":210,"dayBudgetSummary":{"dailyBudget":2000,"accommodationCostPerNight":700,"remainingAfterAccommodation":1300,"activitiesCost":210,"remainingAfterActivities":1090},"remainingTripBudget":4060},{"day":3,"title":"اليوم الثالث","activities":[{"startTime":"09:00","endTime":"11:30","period":"صباحًا","activity":"الرياض بارك","description":"مول حديث للتسوق والترفيه العائلي. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"150 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":100},{"startTime":"12:00","endTime":"12:30","period":"ظهرًا","activity":"برج المجدول","description":"معلم حضري معروف مناسب للتصوير الخارجي وجولة سريعة في المنطقة المحيطة. — السعر التقريبي: 0–50 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"30 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":60},{"startTime":"13:00","endTime":"15:00","period":"ظهرًا","activity":"صحارى مول","description":"مول معروف مناسب للعائلات. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":100},{"startTime":"15:30","endTime":"17:30","period":"ظهرًا","activity":"LPM الرياض","description":"مطعم فرنسي متوسطي راقٍ. — السعر التقريبي: 180–300 ر.س","type":"مطاعم","category":"مطاعم","duration":"120 دقيقة","cost":"0.00","budgetLevel":"high","estimatedCost":80},{"startTime":"18:00","endTime":"20:00","period":"مساءً","activity":"ذا فيو مول","description":"مول للتسوق وقضاء وقت داخل المدينة. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":100},{"startTime":"20:30","endTime":"21:30","period":"مساءً","activity":"عين الرياض (عجلة دوّارة)","description":"تجربة إطلالة من عجلة دوارة ضمن فعاليات موسمية (حسب التوفر). — السعر التقريبي: 150–400 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"60 دقيقة","cost":"0.00","budgetLevel":"high","estimatedCost":60}],"dayTotalCost":500,"dayBudgetSummary":{"dailyBudget":2000,"accommodationCostPerNight":700,"remainingAfterAccommodation":1300,"activitiesCost":500,"remainingAfterActivities":800},"remainingTripBudget":2860}],"tripTotalCost":3140,"remainingBudget":2860}	2026-01-24 20:48:19.891648	2026-01-25 13:06:47.799	\N	f
44	1	1	2	2500.00	["ثقافة وتراث","تسوق وترفيه","مغامرات ورياضة"]	متوسط	{"destination":"الرياض","days":2,"budget":2500,"budgetDistribution":{"accommodation":500,"activities":437.5,"food":312.5},"qualityLevel":"عالية","accommodation":{"name":"هيلتون الرياض","nameEn":"Hilton Riyadh Hotel & Residences","class":"mid","priceRange":"700–1200","googleMapsUrl":"https://www.google.com/maps/place/?q=place_id:null","rating":null},"accommodationSelectionNote":null,"noAccommodationMessage":null,"dailyBudget":1250,"accommodationCostPerNight":700,"remainingAfterAccommodation":550,"budgetNote":null,"budgetActivityNote":null,"dailyPlan":[{"day":1,"title":"اليوم الأول","activities":[{"startTime":"09:00","endTime":"09:45","period":"صباحًا","activity":"جامع الراجحي","description":"من أكبر المساجد في الرياض، مناسب لزيارة قصيرة. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"45 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"10:15","endTime":"12:15","period":"صباحًا","activity":"النخيل مول","description":"مول مناسب للعائلات والتسوق والترفيه. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":100},{"startTime":"12:45","endTime":"14:45","period":"ظهرًا","activity":"سنتريا مول","description":"مول راقٍ للتسوق في العليا. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"high","estimatedCost":100},{"startTime":"15:15","endTime":"16:45","period":"ظهرًا","activity":"سوق المعيقلية","description":"سوق/مركز معروف للتسوق في وسط الرياض. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":100},{"startTime":"17:15","endTime":"19:15","period":"مساءً","activity":"المتحف الوطني السعودي","description":"متحف شامل لتاريخ المملكة، مناسب للعائلات. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"120 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"19:45","endTime":"21:15","period":"مساءً","activity":"سوق الحلة","description":"سوق محلي بأجواء شعبية للتسوق الخفيف. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":100}],"dayTotalCost":440,"dayBudgetSummary":{"dailyBudget":1250,"accommodationCostPerNight":700,"remainingAfterAccommodation":550,"activitiesCost":440,"remainingAfterActivities":110},"remainingTripBudget":1360},{"day":2,"title":"اليوم الثاني","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"سوق طيبة","description":"سوق معروف للملابس والمنتجات المحلية. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":100},{"startTime":"11:00","endTime":"13:00","period":"صباحًا","activity":"القصر مول","description":"مول كبير للتسوق والترفيه. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":100},{"startTime":"13:30","endTime":"15:30","period":"ظهرًا","activity":"غرناطة مول","description":"مول كبير مناسب للعائلات وخيارات طعام. — الدخول مجاني؛ المصروف حسب التسوق (0–400 ر.س)","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium","estimatedCost":100},{"startTime":"16:00","endTime":"18:00","period":"مساءً","activity":"مركز الملك عبدالعزيز التاريخي","description":"مجمع تاريخي وثقافي يضم عدة مرافق ومعارض. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"120 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"18:30","endTime":"21:00","period":"مساءً","activity":"روشن فرونت","description":"وجهة تضم تسوق ومطاعم وخيارات ترفيه. — السعر التقريبي: 150–400 ر.س للشخص","type":"ترفيه","category":"ترفيه","duration":"150 دقيقة","cost":"0.00","budgetLevel":"high","estimatedCost":60},{"startTime":"21:30","endTime":"22:15","period":"مساءً","activity":"قصر معذر","description":"معلم تراثي في الرياض مناسب للزيارة القصيرة والتصوير. — السعر التقريبي: 0–50 ر.س (قد يكون مجانيًا أو برسوم بسيطة)","type":"تراث","category":"تراث","duration":"45 دقيقة","cost":"0.00","budgetLevel":"low","estimatedCost":20}],"dayTotalCost":400,"dayBudgetSummary":{"dailyBudget":1250,"accommodationCostPerNight":700,"remainingAfterAccommodation":550,"activitiesCost":400,"remainingAfterActivities":150},"remainingTripBudget":260}],"tripTotalCost":2240,"remainingBudget":260}	2026-01-25 23:26:33.801581	2026-01-25 23:26:33.801581	\N	f
54	1	1	3	3000.00	["ثقافة وتراث","عائلي وأطفال","طعام ومطاعم"]	متوسط	{"destination":"الرياض","days":3,"budget":3000,"budgetDistribution":{"accommodation":400,"activities":350,"food":250},"qualityLevel":"عالية","accommodation":{"name":"فندق التنفيذيين","nameEn":"Executives Hotel","class":"mid","priceRange":"550-650","googleMapsUrl":"https://www.google.com/maps/place/?q=place_id:null","rating":null},"accommodationSelectionNote":null,"noAccommodationMessage":null,"dailyBudget":1000,"accommodationCostPerNight":550,"remainingAfterAccommodation":450,"budgetNote":null,"budgetActivityNote":null,"dailyPlan":[{"day":1,"title":"اليوم الأول","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"مطعم زعفران","description":"استمتع بـمطعم زعفران في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"high","estimatedCost":80},{"startTime":"11:00","endTime":"12:30","period":"صباحًا","activity":"مطعم زعفران","description":"استمتع بـمطعم زعفران في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"high","estimatedCost":80},{"startTime":"13:00","endTime":"14:30","period":"ظهرًا","activity":"مطعم القرية النجدية","description":"استمتع بـمطعم القرية النجدية في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"15:00","endTime":"16:30","period":"ظهرًا","activity":"قصر المصمك","description":"استمتع بـقصر المصمك في الرياض","type":"attraction","category":"تراث","duration":"90","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"17:00","endTime":"18:30","period":"مساءً","activity":"حديقة السلام","description":"استمتع بـحديقة السلام في الرياض","type":"park","category":"طبيعة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"19:00","endTime":"20:30","period":"مساءً","activity":"وادي نمار","description":"استمتع بـوادي نمار في الرياض","type":"park","category":"طبيعة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"21:00","endTime":"22:30","period":"مساءً","activity":"النخيل مول","description":"استمتع بـالنخيل مول في الرياض","type":"mall","category":"تسوق","duration":"120","cost":"0.00","budgetLevel":"medium","estimatedCost":100}],"dayTotalCost":930,"dayBudgetSummary":{"dailyBudget":1000,"accommodationCostPerNight":550,"remainingAfterAccommodation":450,"activitiesCost":380,"remainingAfterActivities":70},"remainingTripBudget":2070},{"day":2,"title":"اليوم الثاني","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"منتزه الثمامة للحياة الفطرية","description":"استمتع بـمنتزه الثمامة للحياة الفطرية في الرياض","type":"park","category":"طبيعة","duration":"150","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"11:00","endTime":"12:30","period":"صباحًا","activity":"مطعم توينا","description":"استمتع بـمطعم توينا في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"13:00","endTime":"14:30","period":"ظهرًا","activity":"المتحف الوطني السعودي","description":"استمتع بـالمتحف الوطني السعودي في الرياض","type":"museum","category":"ثقافة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":30},{"startTime":"15:00","endTime":"16:30","period":"ظهرًا","activity":"المتحف الوطني السعودي","description":"استمتع بـالمتحف الوطني السعودي في الرياض","type":"museum","category":"ثقافة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":30},{"startTime":"17:00","endTime":"18:30","period":"مساءً","activity":"حلويات ومقهى (سناك)","description":"استمتع بـحلويات ومقهى (سناك) في الرياض","type":"restaurant","category":"مطاعم","duration":"45","cost":"0.00","budgetLevel":"low","estimatedCost":80},{"startTime":"19:00","endTime":"20:30","period":"مساءً","activity":"مطعم لوسين","description":"استمتع بـمطعم لوسين في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"high","estimatedCost":80},{"startTime":"21:00","endTime":"22:30","period":"مساءً","activity":"مطعم سهيل","description":"استمتع بـمطعم سهيل في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80}],"dayTotalCost":940,"dayBudgetSummary":{"dailyBudget":1000,"accommodationCostPerNight":550,"remainingAfterAccommodation":450,"activitiesCost":390,"remainingAfterActivities":60},"remainingTripBudget":1130},{"day":3,"title":"اليوم الثالث","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"مخبز بول","description":"استمتع بـمخبز بول في الرياض","type":"restaurant","category":"مطاعم","duration":"60","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"11:00","endTime":"12:30","period":"صباحًا","activity":"واجهة الرياض","description":"استمتع بـواجهة الرياض في الرياض","type":"attraction","category":"ترفيه","duration":"120","cost":"0.00","budgetLevel":"medium","estimatedCost":60},{"startTime":"13:00","endTime":"14:30","period":"ظهرًا","activity":"مطعم القرية النجدية","description":"استمتع بـمطعم القرية النجدية في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"15:00","endTime":"16:30","period":"ظهرًا","activity":"بوليفارد رياض سيتي","description":"استمتع بـبوليفارد رياض سيتي في الرياض","type":"attraction","category":"ترفيه","duration":"120","cost":"0.00","budgetLevel":"medium","estimatedCost":60},{"startTime":"17:00","endTime":"18:30","period":"مساءً","activity":"كافيه مختص","description":"استمتع بـكافيه مختص في الرياض","type":"restaurant","category":"مطاعم","duration":"45","cost":"0.00","budgetLevel":"low","estimatedCost":80},{"startTime":"19:00","endTime":"20:30","period":"مساءً","activity":"مطعم توينا","description":"استمتع بـمطعم توينا في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"21:00","endTime":"22:30","period":"مساءً","activity":"منتزه الثمامة للحياة الفطرية","description":"استمتع بـمنتزه الثمامة للحياة الفطرية في الرياض","type":"park","category":"طبيعة","duration":"150","cost":"0.00","budgetLevel":"low","estimatedCost":10}],"dayTotalCost":1000,"dayBudgetSummary":{"dailyBudget":1000,"accommodationCostPerNight":550,"remainingAfterAccommodation":450,"activitiesCost":450,"remainingAfterActivities":0},"remainingTripBudget":130}],"tripTotalCost":4520,"remainingBudget":0}	2026-01-26 18:44:55.318892	2026-01-26 18:44:55.318892	\N	f
53	1	1	3	2000.00	["ثقافة وتراث","طعام ومطاعم"]	متوسط	{"destination":"الرياض","days":3,"budget":2000,"budgetDistribution":{"accommodation":266.6666666666667,"activities":233.33333333333331,"food":166.66666666666666},"qualityLevel":"متوسطة","accommodation":{"name":"فندق التنفيذيين","nameEn":"Executives Hotel","class":"mid","priceRange":"550-650","googleMapsUrl":"https://www.google.com/maps/place/?q=place_id:null","rating":null},"accommodationSelectionNote":null,"noAccommodationMessage":null,"dailyBudget":666.6666666666666,"accommodationCostPerNight":550,"remainingAfterAccommodation":116.66666666666663,"budgetNote":null,"budgetActivityNote":"تم تقييد الأنشطة لتناسب المتبقي بعد السكن.","dailyPlan":[{"day":1,"title":"اليوم الأول","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"مطعم أزال","description":"استمتع بـمطعم أزال في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"11:00","endTime":"12:30","period":"صباحًا","activity":"وادي نمار","description":"استمتع بـوادي نمار في الرياض","type":"park","category":"طبيعة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"13:00","endTime":"14:30","period":"ظهرًا","activity":"حديقة السلام","description":"استمتع بـحديقة السلام في الرياض","type":"park","category":"طبيعة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"15:00","endTime":"16:30","period":"ظهرًا","activity":"منتزه الثمامة للحياة الفطرية","description":"استمتع بـمنتزه الثمامة للحياة الفطرية في الرياض","type":"park","category":"طبيعة","duration":"150","cost":"0.00","budgetLevel":"low","estimatedCost":10}],"dayTotalCost":660,"dayBudgetSummary":{"dailyBudget":666.6666666666666,"accommodationCostPerNight":550,"remainingAfterAccommodation":116.66666666666663,"activitiesCost":110,"remainingAfterActivities":6.666666666666629},"remainingTripBudget":1340},{"day":2,"title":"اليوم الثاني","activities":[],"dayTotalCost":550,"dayBudgetSummary":{"dailyBudget":666.6666666666666,"accommodationCostPerNight":550,"remainingAfterAccommodation":116.66666666666663,"activitiesCost":0,"remainingAfterActivities":116.66666666666663},"remainingTripBudget":790},{"day":3,"title":"اليوم الثالث","activities":[],"dayTotalCost":550,"dayBudgetSummary":{"dailyBudget":666.6666666666666,"accommodationCostPerNight":550,"remainingAfterAccommodation":116.66666666666663,"activitiesCost":0,"remainingAfterActivities":116.66666666666663},"remainingTripBudget":240}],"tripTotalCost":3410,"remainingBudget":0}	2026-01-26 18:38:25.591222	2026-01-26 18:38:25.591222	\N	f
55	1	1	5	9000.00	["مغامرات ورياضة","تسوق وترفيه","عائلي وأطفال","طعام ومطاعم","ثقافة وتراث"]	فاخر	{"destination":"الرياض","days":5,"budget":9000,"budgetDistribution":{"accommodation":720,"activities":630,"food":450},"qualityLevel":"عالية","accommodation":{"name":"فندق الفورسيزونز الرياض","nameEn":"Four Seasons Riyadh","class":"luxury","priceRange":"1200-1600","googleMapsUrl":"https://www.google.com/maps/place/?q=place_id:null","rating":null},"accommodationSelectionNote":null,"noAccommodationMessage":null,"dailyBudget":1800,"accommodationCostPerNight":1200,"remainingAfterAccommodation":600,"budgetNote":null,"budgetActivityNote":null,"dailyPlan":[{"day":1,"title":"اليوم الأول","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"قصر المصمك","description":"استمتع بـقصر المصمك في الرياض","type":"attraction","category":"تراث","duration":"90","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"11:00","endTime":"12:30","period":"صباحًا","activity":"قصر المصمك","description":"استمتع بـقصر المصمك في الرياض","type":"attraction","category":"تراث","duration":"90","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"13:00","endTime":"14:30","period":"ظهرًا","activity":"مطعم زعفران","description":"استمتع بـمطعم زعفران في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"high","estimatedCost":80},{"startTime":"15:00","endTime":"16:30","period":"ظهرًا","activity":"مركز الملك عبدالعزيز التاريخي","description":"استمتع بـمركز الملك عبدالعزيز التاريخي في الرياض","type":"attraction","category":"ثقافة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":30},{"startTime":"17:00","endTime":"18:30","period":"مساءً","activity":"مطعم لوسين","description":"استمتع بـمطعم لوسين في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"high","estimatedCost":80},{"startTime":"19:00","endTime":"20:30","period":"مساءً","activity":"حلويات باتشي","description":"استمتع بـحلويات باتشي في الرياض","type":"restaurant","category":"مطاعم","duration":"45","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"21:00","endTime":"22:30","period":"مساءً","activity":"منتزه الثمامة للحياة الفطرية","description":"استمتع بـمنتزه الثمامة للحياة الفطرية في الرياض","type":"park","category":"طبيعة","duration":"150","cost":"0.00","budgetLevel":"low","estimatedCost":10}],"dayTotalCost":1520,"dayBudgetSummary":{"dailyBudget":1800,"accommodationCostPerNight":1200,"remainingAfterAccommodation":600,"activitiesCost":320,"remainingAfterActivities":280},"remainingTripBudget":7480},{"day":2,"title":"اليوم الثاني","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"مطعم لوسين","description":"استمتع بـمطعم لوسين في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"high","estimatedCost":80},{"startTime":"11:00","endTime":"12:30","period":"صباحًا","activity":"مطعم توينا","description":"استمتع بـمطعم توينا في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"13:00","endTime":"14:30","period":"ظهرًا","activity":"مقهى كافد","description":"استمتع بـمقهى كافد في الرياض","type":"restaurant","category":"مطاعم","duration":"60","cost":"0.00","budgetLevel":"low","estimatedCost":80},{"startTime":"15:00","endTime":"16:30","period":"ظهرًا","activity":"مقهى كافد (فطور)","description":"استمتع بـمقهى كافد (فطور) في الرياض","type":"restaurant","category":"مطاعم","duration":"60","cost":"0.00","budgetLevel":"low","estimatedCost":80},{"startTime":"17:00","endTime":"18:30","period":"مساءً","activity":"مخبز بول","description":"استمتع بـمخبز بول في الرياض","type":"restaurant","category":"مطاعم","duration":"60","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"19:00","endTime":"20:30","period":"مساءً","activity":"مطعم أزال","description":"استمتع بـمطعم أزال في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"21:00","endTime":"22:30","period":"مساءً","activity":"الرياض بارك","description":"استمتع بـالرياض بارك في الرياض","type":"mall","category":"تسوق","duration":"120","cost":"0.00","budgetLevel":"medium","estimatedCost":100}],"dayTotalCost":1780,"dayBudgetSummary":{"dailyBudget":1800,"accommodationCostPerNight":1200,"remainingAfterAccommodation":600,"activitiesCost":580,"remainingAfterActivities":20},"remainingTripBudget":5700},{"day":3,"title":"اليوم الثالث","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"مطعم سهيل","description":"استمتع بـمطعم سهيل في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"11:00","endTime":"12:30","period":"صباحًا","activity":"النخيل مول","description":"استمتع بـالنخيل مول في الرياض","type":"mall","category":"تسوق","duration":"120","cost":"0.00","budgetLevel":"medium","estimatedCost":100},{"startTime":"13:00","endTime":"14:30","period":"ظهرًا","activity":"المتحف الوطني السعودي","description":"استمتع بـالمتحف الوطني السعودي في الرياض","type":"museum","category":"ثقافة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":30},{"startTime":"15:00","endTime":"16:30","period":"ظهرًا","activity":"المتحف الوطني السعودي","description":"استمتع بـالمتحف الوطني السعودي في الرياض","type":"museum","category":"ثقافة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":30},{"startTime":"17:00","endTime":"18:30","period":"مساءً","activity":"مطعم توينا","description":"استمتع بـمطعم توينا في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"19:00","endTime":"20:30","period":"مساءً","activity":"واجهة الرياض","description":"استمتع بـواجهة الرياض في الرياض","type":"attraction","category":"ترفيه","duration":"120","cost":"0.00","budgetLevel":"medium","estimatedCost":60},{"startTime":"21:00","endTime":"22:30","period":"مساءً","activity":"وادي نمار","description":"استمتع بـوادي نمار في الرياض","type":"park","category":"طبيعة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":10}],"dayTotalCost":1590,"dayBudgetSummary":{"dailyBudget":1800,"accommodationCostPerNight":1200,"remainingAfterAccommodation":600,"activitiesCost":390,"remainingAfterActivities":210},"remainingTripBudget":4110},{"day":4,"title":"اليوم الرابع","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"متحف النقد","description":"استمتع بـمتحف النقد في الرياض","type":"museum","category":"تراث","duration":"60","cost":"0.00","budgetLevel":"low","estimatedCost":20},{"startTime":"11:00","endTime":"12:30","period":"صباحًا","activity":"كافيه مختص","description":"استمتع بـكافيه مختص في الرياض","type":"restaurant","category":"مطاعم","duration":"45","cost":"0.00","budgetLevel":"low","estimatedCost":80},{"startTime":"13:00","endTime":"14:30","period":"ظهرًا","activity":"حديقة السلام","description":"استمتع بـحديقة السلام في الرياض","type":"park","category":"طبيعة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"15:00","endTime":"16:30","period":"ظهرًا","activity":"مطعم القرية النجدية","description":"استمتع بـمطعم القرية النجدية في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"17:00","endTime":"18:30","period":"مساءً","activity":"وادي نمار","description":"استمتع بـوادي نمار في الرياض","type":"park","category":"طبيعة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"19:00","endTime":"20:30","period":"مساءً","activity":"حديقة السلام","description":"استمتع بـحديقة السلام في الرياض","type":"park","category":"طبيعة","duration":"120","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"21:00","endTime":"22:30","period":"مساءً","activity":"النخيل مول","description":"استمتع بـالنخيل مول في الرياض","type":"mall","category":"تسوق","duration":"120","cost":"0.00","budgetLevel":"medium","estimatedCost":100}],"dayTotalCost":1510,"dayBudgetSummary":{"dailyBudget":1800,"accommodationCostPerNight":1200,"remainingAfterAccommodation":600,"activitiesCost":310,"remainingAfterActivities":290},"remainingTripBudget":2600},{"day":5,"title":"اليوم الخامس","activities":[{"startTime":"09:00","endTime":"10:30","period":"صباحًا","activity":"كافيه مختص (سناك)","description":"استمتع بـكافيه مختص (سناك) في الرياض","type":"restaurant","category":"مطاعم","duration":"45","cost":"0.00","budgetLevel":"low","estimatedCost":80},{"startTime":"11:00","endTime":"12:30","period":"صباحًا","activity":"واجهة الرياض","description":"استمتع بـواجهة الرياض في الرياض","type":"attraction","category":"ترفيه","duration":"120","cost":"0.00","budgetLevel":"medium","estimatedCost":60},{"startTime":"13:00","endTime":"14:30","period":"ظهرًا","activity":"مطعم القرية النجدية","description":"استمتع بـمطعم القرية النجدية في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"medium","estimatedCost":80},{"startTime":"15:00","endTime":"16:30","period":"ظهرًا","activity":"حلويات ومقهى (سناك)","description":"استمتع بـحلويات ومقهى (سناك) في الرياض","type":"restaurant","category":"مطاعم","duration":"45","cost":"0.00","budgetLevel":"low","estimatedCost":80},{"startTime":"17:00","endTime":"18:30","period":"مساءً","activity":"منتزه الثمامة للحياة الفطرية","description":"استمتع بـمنتزه الثمامة للحياة الفطرية في الرياض","type":"park","category":"طبيعة","duration":"150","cost":"0.00","budgetLevel":"low","estimatedCost":10},{"startTime":"19:00","endTime":"20:30","period":"مساءً","activity":"بوليفارد رياض سيتي","description":"استمتع بـبوليفارد رياض سيتي في الرياض","type":"attraction","category":"ترفيه","duration":"120","cost":"0.00","budgetLevel":"medium","estimatedCost":60},{"startTime":"21:00","endTime":"22:30","period":"مساءً","activity":"مطعم زعفران","description":"استمتع بـمطعم زعفران في الرياض","type":"restaurant","category":"مطاعم","duration":"90","cost":"0.00","budgetLevel":"high","estimatedCost":80}],"dayTotalCost":1650,"dayBudgetSummary":{"dailyBudget":1800,"accommodationCostPerNight":1200,"remainingAfterAccommodation":600,"activitiesCost":450,"remainingAfterActivities":150},"remainingTripBudget":950}],"tripTotalCost":14050,"remainingBudget":0}	2026-01-26 21:44:20.132689	2026-01-26 21:44:20.132689	\N	f
\.


--
-- TOC entry 3522 (class 0 OID 16609)
-- Dependencies: 236
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: myapp_00u9_user
--

COPY public.users (id, name, email, password, role, tier, phone, city, created_at, updated_at, last_signed_in, full_name) FROM stdin;
3	HALA ALAMRI	ixxzdhr803@gmail.com	$2b$10$Hoo1I4E95fAYGxPdFSz9vOMgIj0YLQQmr65QaNGQB0KIa2Gitutq6	user	professional	\N	الرياض 	2026-01-19 14:13:02.115965	2026-01-19 14:13:02.115965	2026-01-19 14:13:02.115965	\N
2	ndifgiedhf	test@gmail.com	$2b$10$B1.Zeci5xCV7/Pl6A/lNBO/KIAsS1gH1YcdhMhJOTPTpwdmh1Gi12	user	smart	\N	\N	2026-01-19 03:57:51.910243	2026-01-19 03:57:51.910243	2026-01-26 18:17:59.538	\N
1	mohammed	i7mody507@gmail.com	$2b$10$rrwsDr6yguWWUChXvK.VFe1z58wsoNvu3lAqs//FX0ecmuk2S/3ru	admin	professional	\N	\N	2026-01-16 01:27:26.412013	2026-01-16 01:27:26.412013	2026-01-28 15:53:54.594	\N
\.


--
-- TOC entry 3538 (class 0 OID 0)
-- Dependencies: 221
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: myapp_00u9_user
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


--
-- TOC entry 3539 (class 0 OID 0)
-- Dependencies: 223
-- Name: accommodations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myapp_00u9_user
--

SELECT pg_catalog.setval('public.accommodations_id_seq', 103, true);


--
-- TOC entry 3540 (class 0 OID 0)
-- Dependencies: 225
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myapp_00u9_user
--

SELECT pg_catalog.setval('public.activities_id_seq', 583, true);


--
-- TOC entry 3541 (class 0 OID 0)
-- Dependencies: 227
-- Name: destinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myapp_00u9_user
--

SELECT pg_catalog.setval('public.destinations_id_seq', 23, true);


--
-- TOC entry 3542 (class 0 OID 0)
-- Dependencies: 229
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myapp_00u9_user
--

SELECT pg_catalog.setval('public.favorites_id_seq', 1, false);


--
-- TOC entry 3543 (class 0 OID 0)
-- Dependencies: 231
-- Name: restaurants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myapp_00u9_user
--

SELECT pg_catalog.setval('public.restaurants_id_seq', 1, false);


--
-- TOC entry 3544 (class 0 OID 0)
-- Dependencies: 233
-- Name: support_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myapp_00u9_user
--

SELECT pg_catalog.setval('public.support_messages_id_seq', 3, true);


--
-- TOC entry 3545 (class 0 OID 0)
-- Dependencies: 235
-- Name: trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myapp_00u9_user
--

SELECT pg_catalog.setval('public.trips_id_seq', 55, true);


--
-- TOC entry 3546 (class 0 OID 0)
-- Dependencies: 237
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myapp_00u9_user
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- TOC entry 3332 (class 2606 OID 16640)
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: myapp_00u9_user
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3334 (class 2606 OID 16642)
-- Name: accommodations accommodations_external_id_key; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_external_id_key UNIQUE (external_id);


--
-- TOC entry 3336 (class 2606 OID 16644)
-- Name: accommodations accommodations_pkey; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_pkey PRIMARY KEY (id);


--
-- TOC entry 3338 (class 2606 OID 16646)
-- Name: activities activities_external_id_key; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_external_id_key UNIQUE (external_id);


--
-- TOC entry 3340 (class 2606 OID 16648)
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- TOC entry 3342 (class 2606 OID 16650)
-- Name: destinations destinations_external_id_key; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_external_id_key UNIQUE (external_id);


--
-- TOC entry 3344 (class 2606 OID 16652)
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- TOC entry 3346 (class 2606 OID 16654)
-- Name: destinations destinations_slug_unique; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_slug_unique UNIQUE (slug);


--
-- TOC entry 3348 (class 2606 OID 16656)
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- TOC entry 3350 (class 2606 OID 16658)
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- TOC entry 3352 (class 2606 OID 16660)
-- Name: support_messages support_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 3354 (class 2606 OID 16662)
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- TOC entry 3356 (class 2606 OID 16664)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3358 (class 2606 OID 16666)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: myapp_00u9_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 2121 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO myapp_00u9_user;


--
-- TOC entry 2123 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO myapp_00u9_user;


--
-- TOC entry 2122 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO myapp_00u9_user;


--
-- TOC entry 2120 (class 826 OID 16390)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO myapp_00u9_user;


-- Completed on 2026-01-28 21:05:53

--
-- PostgreSQL database dump complete
--

\unrestrict W3FFakHFZPdmOmx5eSiEwdgHF8Q060KLQnuPEBTdm8EznM7oPzdmky51Prv7JXG


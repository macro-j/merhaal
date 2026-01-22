--
-- PostgreSQL database dump
--

\restrict 3EQgTU51hpmOqjrOX3n2ax6cybzRFoq6kK6QJCtgepCScAY82XsHaxAlAxZ5VZt

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

--
-- Name: accommodation_class; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.accommodation_class AS ENUM (
    'economy',
    'mid',
    'luxury'
);


ALTER TYPE public.accommodation_class OWNER TO postgres;

--
-- Name: accommodation_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.accommodation_type AS ENUM (
    'فاخر',
    'متوسط',
    'اقتصادي',
    'شقق مفروشة',
    'استراحات'
);


ALTER TYPE public.accommodation_type OWNER TO postgres;

--
-- Name: activity_category; Type: TYPE; Schema: public; Owner: postgres
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


ALTER TYPE public.activity_category OWNER TO postgres;

--
-- Name: best_time; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.best_time AS ENUM (
    'morning',
    'afternoon',
    'evening',
    'anytime'
);


ALTER TYPE public.best_time OWNER TO postgres;

--
-- Name: budget_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.budget_level AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.budget_level OWNER TO postgres;

--
-- Name: item_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.item_type AS ENUM (
    'destination',
    'activity',
    'accommodation',
    'restaurant'
);


ALTER TYPE public.item_type OWNER TO postgres;

--
-- Name: price_range; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.price_range AS ENUM (
    'فاخر',
    'متوسط',
    'اقتصادي'
);


ALTER TYPE public.price_range OWNER TO postgres;

--
-- Name: role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public.role OWNER TO postgres;

--
-- Name: tier; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tier AS ENUM (
    'free',
    'smart',
    'professional'
);


ALTER TYPE public.tier OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: accommodations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.accommodations OWNER TO postgres;

--
-- Name: accommodations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accommodations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accommodations_id_seq OWNER TO postgres;

--
-- Name: accommodations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accommodations_id_seq OWNED BY public.accommodations.id;


--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activities_id_seq OWNER TO postgres;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: destinations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.destinations OWNER TO postgres;

--
-- Name: destinations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.destinations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destinations_id_seq OWNER TO postgres;

--
-- Name: destinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destinations_id_seq OWNED BY public.destinations.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    item_type public.item_type NOT NULL,
    item_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorites_id_seq OWNER TO postgres;

--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: restaurants; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.restaurants OWNER TO postgres;

--
-- Name: restaurants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restaurants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurants_id_seq OWNER TO postgres;

--
-- Name: restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurants_id_seq OWNED BY public.restaurants.id;


--
-- Name: support_messages; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.support_messages OWNER TO postgres;

--
-- Name: support_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.support_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.support_messages_id_seq OWNER TO postgres;

--
-- Name: support_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.support_messages_id_seq OWNED BY public.support_messages.id;


--
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.trips OWNER TO postgres;

--
-- Name: trips_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trips_id_seq OWNER TO postgres;

--
-- Name: trips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trips_id_seq OWNED BY public.trips.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
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
    last_signed_in timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: accommodations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accommodations ALTER COLUMN id SET DEFAULT nextval('public.accommodations_id_seq'::regclass);


--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: destinations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations ALTER COLUMN id SET DEFAULT nextval('public.destinations_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: restaurants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants ALTER COLUMN id SET DEFAULT nextval('public.restaurants_id_seq'::regclass);


--
-- Name: support_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_messages ALTER COLUMN id SET DEFAULT nextval('public.support_messages_id_seq'::regclass);


--
-- Name: trips id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips ALTER COLUMN id SET DEFAULT nextval('public.trips_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	32eda1db6c1c18729f2d180210956e58f25034135aea821dc05465361d20e7d0	1768526677532
2	5a88a263e78f1a1cac2e1adff8a5de0c302f03336d030b38292a34147652da4a	1768585901357
\.


--
-- Data for Name: accommodations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accommodations (id, destination_id, rating, created_at, name_ar, name_en, description_ar, description_en, class, google_place_id, google_maps_url, is_active, updated_at, price_range, external_id) FROM stdin;
1	1	\N	2026-01-16 20:16:55.897108	فندق اقتصادي (مثال)	Budget Hotel (example)	خيار اقتصادي مناسب لرحلة سريعة. حدّث الاسم بالرابط الصحيح من لوحة الأدمن لاحقًا.	\N	economy	\N	https://www.google.com/maps/search/?api=1&query=budget+hotel+riyadh	t	2026-01-16 20:16:55.897108	200–350	riy-eco-ibis-01
2	1	\N	2026-01-16 20:16:55.900378	نوفوتيل الرياض العنود	Novotel Riyadh Al Anoud	فندق متوسط قرب مركز المملكة—مناسب للأعمال والعائلات.	\N	mid	\N	https://www.google.com/maps/search/?api=1&query=Novotel+Riyadh+Al+Anoud	t	2026-01-16 20:16:55.900378	450–700	riy-mid-novotel-01
3	1	\N	2026-01-16 20:16:55.90406	فندق فورسيزونز الرياض	Four Seasons Hotel Riyadh	خيار فاخر في قلب المدينة بخدمات عالية.	\N	luxury	\N	https://www.google.com/maps/search/?api=1&query=Four+Seasons+Hotel+Riyadh	t	2026-01-16 20:16:55.90406	1200–2200	riy-lux-four-seasons-01
4	1	\N	2026-01-16 20:16:55.907574	ذا ريتز-كارلتون الرياض	The Ritz-Carlton, Riyadh	فندق فاخر بتجربة ضيافة راقية ومساحات مميزة.	\N	luxury	\N	https://www.google.com/maps/search/?api=1&query=The+Ritz-Carlton+Riyadh	t	2026-01-16 20:16:55.907574	1100–2000	riy-lux-ritz-01
5	1	\N	2026-01-16 20:16:55.911175	ماندارين أورينتال الفيصلية	Mandarin Oriental Al Faisaliah, Riyadh	خيار فاخر معروف بالخدمة والموقع.	\N	luxury	\N	https://www.google.com/maps/search/?api=1&query=Mandarin+Oriental+Al+Faisaliah+Riyadh	t	2026-01-16 20:16:55.911175	1300–2500	riy-lux-mandarin-01
6	1	\N	2026-01-16 20:16:55.914298	JW ماريوت الرياض	JW Marriott Hotel Riyadh	فندق فاخر مناسب لتجربة إقامة راقية.	\N	luxury	\N	https://www.google.com/maps/search/?api=1&query=JW+Marriott+Hotel+Riyadh	t	2026-01-16 20:16:55.914298	1100–2100	riy-lux-jw-01
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, destination_id, name, name_en, type, duration, cost, icon, min_tier, details, is_active, created_at, category, tags, budget_level, best_time_of_day, details_en, google_maps_url, external_id) FROM stdin;
1	1	قصر المصمك	Masmak Fort	تراث	60 دقيقة	0.00	\N	free	معلم تاريخي في قلب الرياض يمنحك جرعة تراثية سريعة وممتعة.	t	2026-01-16 20:16:55.809859	تراث	["تاريخي","ثقافي","عائلي","داخلي"]	low	morning	\N	https://www.google.com/maps/search/?api=1&query=Masmak+Fort+Riyadh	riy-masmak
2	1	المتحف الوطني السعودي	National Museum of Saudi Arabia	تراث	90 دقيقة	0.00	\N	free	متحف حديث يعرّف تاريخ المملكة بأسلوب تفاعلي مناسب للجميع.	t	2026-01-16 20:16:55.814326	تراث	["ثقافي","تعليمي","عائلي","داخلي"]	low	morning	\N	https://www.google.com/maps/search/?api=1&query=National+Museum+of+Saudi+Arabia+Riyadh	riy-national-museum
3	1	قصر المربع	Murabba Palace	تراث	60 دقيقة	0.00	\N	smart	قصر تاريخي يعكس الطراز النجدي وتفاصيل الحياة القديمة.	t	2026-01-16 20:16:55.822613	تراث	["تاريخي","ثقافي","داخلي"]	low	morning	\N	https://www.google.com/maps/search/?api=1&query=Murabba+Palace+Riyadh	riy-murabba-palace
4	1	مركز الملك عبدالعزيز التاريخي	King Abdulaziz Historical Center	تراث	120 دقيقة	0.00	\N	free	مجمع ثقافي (متحف/حدائق) مناسب لنصف يوم خفيف.	t	2026-01-16 20:16:55.826585	تراث	["ثقافي","حدائق","عائلي"]	low	morning	\N	https://www.google.com/maps/search/?api=1&query=King+Abdulaziz+Historical+Center+Riyadh	riy-kahc
5	1	حي الطريف بالدرعية	At-Turaif District (Diriyah)	تراث	150 دقيقة	0.00	\N	smart	موقع تراث عالمي وممشى ثقافي—الأفضل عصرًا قبل العشاء.	t	2026-01-16 20:16:55.830764	تراث	["تراث","خارجي","تصوير"]	medium	afternoon	\N	https://www.google.com/maps/search/?api=1&query=At-Turaif+Diriyah	riy-diriyah-turaif
6	1	مطل البجيري	Bujairi Terrace	مطاعم	120 دقيقة	0.00	\N	professional	وجهة مطاعم بإطلالة على الطريف—ملائمة لميزانية متوسطة إلى عالية.	t	2026-01-16 20:16:55.835507	مطاعم	["مطاعم","اطلالة","مساء"]	high	evening	\N	https://www.google.com/maps/search/?api=1&query=Bujairi+Terrace	riy-bujairi-terrace
7	1	بوليفارد رياض سيتي	Boulevard Riyadh City	ترفيه	150 دقيقة	0.00	\N	free	منطقة ترفيه ومطاعم وأجواء مسائية.	t	2026-01-16 20:16:55.839584	ترفيه	["ترفيه","مطاعم","مساء","شباب"]	medium	evening	\N	https://www.google.com/maps/search/?api=1&query=Boulevard+Riyadh+City	riy-boulevard
8	1	جسر المشاهدة في برج المملكة	Kingdom Centre Sky Bridge	مغامرات	45 دقيقة	0.00	\N	smart	إطلالة بانورامية رائعة، يُفضّل قبل الغروب.	t	2026-01-16 20:16:55.842937	مغامرات	["اطلالة","تصوير","داخلي"]	medium	evening	\N	https://www.google.com/maps/search/?api=1&query=Kingdom+Centre+Sky+Bridge	riy-kingdom-skybridge
9	1	وادي حنيفة	Wadi Hanifa	طبيعة	90 دقيقة	0.00	\N	free	مسارات ومناطق جلوس للطبيعة والاسترخاء.	t	2026-01-16 20:16:55.846234	طبيعة	["طبيعة","خارجي","عائلي","مشي"]	low	afternoon	\N	https://www.google.com/maps/search/?api=1&query=Wadi+Hanifa	riy-wadi-hanifa
10	1	حديقة السلام	Salam Park	عائلي	90 دقيقة	0.00	\N	free	حديقة واسعة وبحيرة—مثالية للعائلات.	t	2026-01-16 20:16:55.849167	عائلي	["عائلي","خارجي","طبيعة"]	low	afternoon	\N	https://www.google.com/maps/search/?api=1&query=Salam+Park+Riyadh	riy-salam-park
11	1	وادي نمار	Wadi Namar	طبيعة	90 دقيقة	0.00	\N	smart	بحيرة وممشى—مناسب لنزهة عصرًا.	t	2026-01-16 20:16:55.852539	طبيعة	["طبيعة","خارجي","تصوير","مشي"]	low	afternoon	\N	https://www.google.com/maps/search/?api=1&query=Wadi+Namar+Riyadh	riy-wadi-namar
12	1	حافة العالم	Edge of the World	مغامرات	240 دقيقة	0.00	\N	professional	تجربة طبيعية شهيرة خارج المدينة—تحتاج وقت أطول.	t	2026-01-16 20:16:55.856406	مغامرات	["طبيعة","مغامرات","خارجي","تصوير"]	medium	morning	\N	https://www.google.com/maps/search/?api=1&query=Edge+of+the+World+Riyadh	riy-edge-of-world
13	1	الرياض بارك	Riyadh Park Mall	تسوق	120 دقيقة	0.00	\N	free	تسوق ومطاعم داخلية مناسبة لمنتصف اليوم.	t	2026-01-16 20:16:55.859833	تسوق	["تسوق","داخلي","عائلي","مطاعم"]	medium	afternoon	\N	https://www.google.com/maps/search/?api=1&query=Riyadh+Park+Mall	riy-riyadh-park-mall
14	1	النخيل مول	Al Nakheel Mall	تسوق	120 دقيقة	0.00	\N	free	مول كبير مع خيارات مطاعم وتجربة تسوق عائلية.	t	2026-01-16 20:16:55.862574	تسوق	["تسوق","داخلي","عائلي"]	medium	afternoon	\N	https://www.google.com/maps/search/?api=1&query=Al+Nakheel+Mall+Riyadh	riy-nakheel-mall
15	1	غرناطة مول	Granada Center	تسوق	120 دقيقة	0.00	\N	free	تسوق ومطاعم وخيارات متنوعة للعائلة.	t	2026-01-16 20:16:55.865724	تسوق	["تسوق","داخلي","عائلي"]	medium	afternoon	\N	https://www.google.com/maps/search/?api=1&query=Granada+Center+Riyadh	riy-granada-center
16	1	حياة مول	Hayat Mall	تسوق	120 دقيقة	0.00	\N	free	مول عائلي مناسب للجلسات والقهوة والتسوق.	t	2026-01-16 20:16:55.86909	تسوق	["تسوق","داخلي","عائلي"]	medium	afternoon	\N	https://www.google.com/maps/search/?api=1&query=Hayat+Mall+Riyadh	riy-hayat-mall
17	1	قرية نجد	Najd Village	مطاعم	90 دقيقة	0.00	\N	smart	مطعم سعودي نجدي مشهور بتجربة تراثية وأطباق محلية.	t	2026-01-16 20:16:55.873017	مطاعم	["سعودي","نجدي","مطاعم","عائلي"]	medium	evening	\N	https://www.google.com/maps/search/?api=1&query=Najd+Village+Riyadh	riy-najd-village
18	1	تكّية (البجيري)	Takya (Bujairi Terrace)	مطاعم	90 دقيقة	0.00	\N	professional	تجربة طعام سعودية ضمن مطل البجيري.	t	2026-01-16 20:16:55.876558	مطاعم	["سعودي","راقي","مساء"]	high	evening	\N	https://www.google.com/maps/search/?api=1&query=Takya+Bujairi+Terrace	riy-takya-bujairi
19	1	Somewhere (البجيري)	Somewhere (Bujairi Terrace)	مطاعم	90 دقيقة	0.00	\N	professional	مطعم ضمن مطل البجيري بأجواء راقية.	t	2026-01-16 20:16:55.879624	مطاعم	["راقي","مساء","اطلالة"]	high	evening	\N	https://www.google.com/maps/search/?api=1&query=Somewhere+Bujairi+Terrace	riy-somewhere-bujairi
20	1	أنجلينا (البجيري)	Angelina (Bujairi Terrace)	مطاعم	60 دقيقة	0.00	\N	professional	حلويات/قهوة ضمن مطل البجيري—مناسب بعد العشاء.	t	2026-01-16 20:16:55.882319	مطاعم	["قهوة","حلويات","راقي"]	high	evening	\N	https://www.google.com/maps/search/?api=1&query=Angelina+Bujairi+Terrace	riy-angelina-bujairi
21	1	حديقة حيوانات الرياض	Riyadh Zoo	عائلي	120 دقيقة	0.00	\N	free	وجهة عائلية ممتعة للأطفال—يفضل عصرًا.	t	2026-01-16 20:16:55.886248	عائلي	["عائلي","خارجي","اطفال"]	low	afternoon	\N	https://www.google.com/maps/search/?api=1&query=Riyadh+Zoo	riy-riyadh-zoo
22	1	سوق الزل	Souq Al Zal	تسوق	75 دقيقة	0.00	\N	smart	سوق شعبي للتحف والسجاد وتجربة تسوق تراثية.	t	2026-01-16 20:16:55.890277	تسوق	["شعبي","تراثي","تسوق"]	low	morning	\N	https://www.google.com/maps/search/?api=1&query=Souq+Al+Zal	riy-souq-alzal
\.


--
-- Data for Name: destinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destinations (id, slug, name_ar, name_en, title_ar, title_en, description_ar, description_en, images, is_active, created_at, updated_at, external_id) FROM stdin;
2	jeddah	جدة	Jeddah	عروس البحر الأحمر	Bride of the Red Sea	مدينة ساحلية تاريخية تمزج بين الحضارة والبحر مع كورنيش خلاب وأسواق تقليدية	A historic coastal city blending civilization and sea with a stunning corniche and traditional markets	["/images/cities/jeddah-hero.jpg"]	t	2026-01-16 04:03:45.786897	2026-01-16 04:03:45.786897	jeddah
4	abha	أبها	Abha	سيدة الضباب	Lady of the Fog	مدينة جبلية باردة بطبيعة خلابة ومناظر ساحرة في قلب عسير	A cool mountain city with stunning nature and charming views in the heart of Asir	["/images/cities/abha-hero.jpg"]	t	2026-01-16 04:03:45.786897	2026-01-16 04:03:45.786897	abha
6	taif	الطائف	Taif	مصيف العرب	Summer Resort of Arabia	مدينة الورد والفواكه في أعالي جبال الحجاز	City of roses and fruits in the highlands of Hijaz	["\\/images\\/cities\\/taif-hero.jpg"]	t	2026-01-16 04:04:58.518833	2026-01-16 04:04:58.518833	taif
3	alula	العلا	AlUla	متحف في الهواء الطلق	An Open-Air Museum	واحة تاريخية بين الصخور الضخمة وآثار الحضارات القديمة	A historical oasis among massive rocks and ancient civilization ruins	["/images/cities/alula-hero.png"]	t	2026-01-16 04:03:45.786897	2026-01-16 04:03:45.786897	alula
1	riyadh	الرياض	Riyadh	الرياض	Riyadh	عاصمة المملكة العربية السعودية؛ تمزج بين التراث النجدي والوجهات الحديثة. مناسبة لعشّاق الثقافة والمطاعم والتجارب الترفيهية.	Capital of Saudi Arabia blending Najdi heritage with modern districts, dining, and entertainment.	["https://images.unsplash.com/photo-1588594029319-6e22f7f89f91"]	t	2026-01-16 04:03:45.786897	2026-01-16 20:16:55.803114	riyadh
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (id, user_id, item_type, item_id, created_at) FROM stdin;
\.


--
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurants (id, destination_id, name, cuisine, price_range, avg_price, rating, specialties, trending, location, created_at) FROM stdin;
\.


--
-- Data for Name: support_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_messages (id, user_id, name, email, subject, message, is_resolved, created_at) FROM stdin;
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trips (id, user_id, destination_id, days, budget, interests, accommodation_type, plan, created_at, updated_at, share_token, is_public) FROM stdin;
4	1	2	5	8500.00	["تسوق وترفيه","ثقافة وتراث"]	متوسط	{"destination":"جدة","days":5,"budget":8500,"budgetDistribution":{"accommodation":680,"activities":595,"food":425},"qualityLevel":"عالية","accommodation":null,"noAccommodationMessage":"لا توجد إقامات في هذا التصنيف لهذه المدينة","dailyPlan":[{"day":1,"title":"اليوم الأول","activities":[{"time":"09:00","period":"صباحًا","activity":"تجربة المأكولات الشعبية","description":"استمتع بتجربة فريدة في جدة","type":"طعام","duration":"2 ساعة","cost":"0"},{"time":"12:00","period":"ظهرًا","activity":"جولة في أسواق جدة","description":"استمتع بتجربة فريدة في جدة","type":"تسوق","duration":"2 ساعة","cost":"0"},{"time":"15:00","period":"عصرًا","activity":"مشاهدة غروب الشمس","description":"استمتع بتجربة فريدة في جدة","type":"طبيعة","duration":"2 ساعة","cost":"0"},{"time":"18:00","period":"مساءً","activity":"زيارة معالم جدة","description":"استمتع بتجربة فريدة في جدة","type":"سياحة","duration":"2 ساعة","cost":"0"},{"time":"09:00","period":"صباحًا","activity":"زيارة معالم جدة","description":"استمتع بتجربة فريدة في جدة","type":"سياحة","duration":"2 ساعة","cost":"0"},{"time":"12:00","period":"ظهرًا","activity":"مشاهدة غروب الشمس","description":"استمتع بتجربة فريدة في جدة","type":"طبيعة","duration":"2 ساعة","cost":"0"},{"time":"15:00","period":"عصرًا","activity":"تجربة المأكولات الشعبية","description":"استمتع بتجربة فريدة في جدة","type":"طعام","duration":"2 ساعة","cost":"0"},{"time":"18:00","period":"مساءً","activity":"تناول العشاء في مطعم محلي","description":"استمتع بتجربة فريدة في جدة","type":"طعام","duration":"2 ساعة","cost":"0"}]},{"day":2,"title":"اليوم الثاني","activities":[{"time":"09:00","period":"صباحًا","activity":"جولة مشي في الحي التاريخي","description":"استمتع بتجربة فريدة في جدة","type":"سياحة","duration":"2 ساعة","cost":"0"},{"time":"12:00","period":"ظهرًا","activity":"مشاهدة غروب الشمس","description":"استمتع بتجربة فريدة في جدة","type":"طبيعة","duration":"2 ساعة","cost":"0"},{"time":"15:00","period":"عصرًا","activity":"تناول العشاء في مطعم محلي","description":"استمتع بتجربة فريدة في جدة","type":"طعام","duration":"2 ساعة","cost":"0"},{"time":"18:00","period":"مساءً","activity":"زيارة الحدائق والمتنزهات","description":"استمتع بتجربة فريدة في جدة","type":"طبيعة","duration":"2 ساعة","cost":"0"},{"time":"09:00","period":"صباحًا","activity":"زيارة معالم جدة","description":"استمتع بتجربة فريدة في جدة","type":"سياحة","duration":"2 ساعة","cost":"0"},{"time":"12:00","period":"ظهرًا","activity":"تجربة المأكولات الشعبية","description":"استمتع بتجربة فريدة في جدة","type":"طعام","duration":"2 ساعة","cost":"0"},{"time":"15:00","period":"عصرًا","activity":"جولة في أسواق جدة","description":"استمتع بتجربة فريدة في جدة","type":"تسوق","duration":"2 ساعة","cost":"0"},{"time":"18:00","period":"مساءً","activity":"استكشاف المتاحف المحلية","description":"استمتع بتجربة فريدة في جدة","type":"ثقافة","duration":"2 ساعة","cost":"0"}]},{"day":3,"title":"اليوم الثالث","activities":[{"time":"09:00","period":"صباحًا","activity":"تجربة المأكولات الشعبية","description":"استمتع بتجربة فريدة في جدة","type":"طعام","duration":"2 ساعة","cost":"0"},{"time":"12:00","period":"ظهرًا","activity":"جولة في أسواق جدة","description":"استمتع بتجربة فريدة في جدة","type":"تسوق","duration":"2 ساعة","cost":"0"},{"time":"15:00","period":"عصرًا","activity":"تناول العشاء في مطعم محلي","description":"استمتع بتجربة فريدة في جدة","type":"طعام","duration":"2 ساعة","cost":"0"},{"time":"18:00","period":"مساءً","activity":"استكشاف المتاحف المحلية","description":"استمتع بتجربة فريدة في جدة","type":"ثقافة","duration":"2 ساعة","cost":"0"},{"time":"09:00","period":"صباحًا","activity":"جولة في أسواق جدة","description":"استمتع بتجربة فريدة في جدة","type":"تسوق","duration":"2 ساعة","cost":"0"},{"time":"12:00","period":"ظهرًا","activity":"استكشاف المتاحف المحلية","description":"استمتع بتجربة فريدة في جدة","type":"ثقافة","duration":"2 ساعة","cost":"0"},{"time":"15:00","period":"عصرًا","activity":"زيارة الحدائق والمتنزهات","description":"استمتع بتجربة فريدة في جدة","type":"طبيعة","duration":"2 ساعة","cost":"0"},{"time":"18:00","period":"مساءً","activity":"جولة مشي في الحي التاريخي","description":"استمتع بتجربة فريدة في جدة","type":"سياحة","duration":"2 ساعة","cost":"0"}]},{"day":4,"title":"اليوم الرابع","activities":[{"time":"09:00","period":"صباحًا","activity":"جولة مشي في الحي التاريخي","description":"استمتع بتجربة فريدة في جدة","type":"سياحة","duration":"2 ساعة","cost":"0"},{"time":"12:00","period":"ظهرًا","activity":"تناول العشاء في مطعم محلي","description":"استمتع بتجربة فريدة في جدة","type":"طعام","duration":"2 ساعة","cost":"0"},{"time":"15:00","period":"عصرًا","activity":"زيارة الحدائق والمتنزهات","description":"استمتع بتجربة فريدة في جدة","type":"طبيعة","duration":"2 ساعة","cost":"0"},{"time":"18:00","period":"مساءً","activity":"استكشاف المتاحف المحلية","description":"استمتع بتجربة فريدة في جدة","type":"ثقافة","duration":"2 ساعة","cost":"0"},{"time":"09:00","period":"صباحًا","activity":"جولة مشي في الحي التاريخي","description":"استمتع بتجربة فريدة في جدة","type":"سياحة","duration":"2 ساعة","cost":"0"},{"time":"12:00","period":"ظهرًا","activity":"استكشاف المتاحف المحلية","description":"استمتع بتجربة فريدة في جدة","type":"ثقافة","duration":"2 ساعة","cost":"0"},{"time":"15:00","period":"عصرًا","activity":"مشاهدة غروب الشمس","description":"استمتع بتجربة فريدة في جدة","type":"طبيعة","duration":"2 ساعة","cost":"0"},{"time":"18:00","period":"مساءً","activity":"زيارة معالم جدة","description":"استمتع بتجربة فريدة في جدة","type":"سياحة","duration":"2 ساعة","cost":"0"}]},{"day":5,"title":"اليوم الخامس","activities":[{"time":"09:00","period":"صباحًا","activity":"جولة في أسواق جدة","description":"استمتع بتجربة فريدة في جدة","type":"تسوق","duration":"2 ساعة","cost":"0"},{"time":"12:00","period":"ظهرًا","activity":"زيارة معالم جدة","description":"استمتع بتجربة فريدة في جدة","type":"سياحة","duration":"2 ساعة","cost":"0"},{"time":"15:00","period":"عصرًا","activity":"زيارة الحدائق والمتنزهات","description":"استمتع بتجربة فريدة في جدة","type":"طبيعة","duration":"2 ساعة","cost":"0"}]}]}	2026-01-18 18:06:45.476068	2026-01-18 18:07:52.545	\N	f
5	1	1	5	20000.00	["ثقافة وتراث","تسوق وترفيه"]	فاخر	{"destination":"الرياض","days":5,"budget":20000,"budgetDistribution":{"accommodation":1600,"activities":1400,"food":1000},"qualityLevel":"عالية","accommodation":{"name":"فندق فورسيزونز الرياض","nameEn":"Four Seasons Hotel Riyadh","class":"luxury","priceRange":"1200–2200","googleMapsUrl":"https://www.google.com/maps/place/?q=place_id:null","rating":null},"noAccommodationMessage":null,"dailyPlan":[{"day":1,"title":"اليوم الأول","activities":[{"time":"09:00","period":"صباحًا","activity":"قصر المصمك","description":"معلم تاريخي في قلب الرياض يمنحك جرعة تراثية سريعة وممتعة.","type":"تراث","category":"تراث","duration":"60 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"12:00","period":"ظهرًا","activity":"حديقة حيوانات الرياض","description":"وجهة عائلية ممتعة للأطفال—يفضل عصرًا.","type":"عائلي","category":"عائلي","duration":"120 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"15:00","period":"عصرًا","activity":"حديقة السلام","description":"حديقة واسعة وبحيرة—مثالية للعائلات.","type":"عائلي","category":"عائلي","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"18:00","period":"مساءً","activity":"تكّية (البجيري)","description":"تجربة طعام سعودية ضمن مطل البجيري.","type":"مطاعم","category":"مطاعم","duration":"90 دقيقة","cost":"0.00","budgetLevel":"high"},{"time":"09:00","period":"صباحًا","activity":"المتحف الوطني السعودي","description":"متحف حديث يعرّف تاريخ المملكة بأسلوب تفاعلي مناسب للجميع.","type":"تراث","category":"تراث","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"12:00","period":"ظهرًا","activity":"حياة مول","description":"مول عائلي مناسب للجلسات والقهوة والتسوق.","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"15:00","period":"عصرًا","activity":"وادي حنيفة","description":"مسارات ومناطق جلوس للطبيعة والاسترخاء.","type":"طبيعة","category":"طبيعة","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"18:00","period":"مساءً","activity":"قرية نجد","description":"مطعم سعودي نجدي مشهور بتجربة تراثية وأطباق محلية.","type":"مطاعم","category":"مطاعم","duration":"90 دقيقة","cost":"0.00","budgetLevel":"medium"}]},{"day":2,"title":"اليوم الثاني","activities":[{"time":"09:00","period":"صباحًا","activity":"سوق الزل","description":"سوق شعبي للتحف والسجاد وتجربة تسوق تراثية.","type":"تسوق","category":"تسوق","duration":"75 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"12:00","period":"ظهرًا","activity":"الرياض بارك","description":"تسوق ومطاعم داخلية مناسبة لمنتصف اليوم.","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"15:00","period":"عصرًا","activity":"النخيل مول","description":"مول كبير مع خيارات مطاعم وتجربة تسوق عائلية.","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"18:00","period":"مساءً","activity":"Somewhere (البجيري)","description":"مطعم ضمن مطل البجيري بأجواء راقية.","type":"مطاعم","category":"مطاعم","duration":"90 دقيقة","cost":"0.00","budgetLevel":"high"},{"time":"09:00","period":"صباحًا","activity":"قصر المربع","description":"قصر تاريخي يعكس الطراز النجدي وتفاصيل الحياة القديمة.","type":"تراث","category":"تراث","duration":"60 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"12:00","period":"ظهرًا","activity":"وادي نمار","description":"بحيرة وممشى—مناسب لنزهة عصرًا.","type":"طبيعة","category":"طبيعة","duration":"90 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"15:00","period":"عصرًا","activity":"غرناطة مول","description":"تسوق ومطاعم وخيارات متنوعة للعائلة.","type":"تسوق","category":"تسوق","duration":"120 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"18:00","period":"مساءً","activity":"بوليفارد رياض سيتي","description":"منطقة ترفيه ومطاعم وأجواء مسائية.","type":"ترفيه","category":"ترفيه","duration":"150 دقيقة","cost":"0.00","budgetLevel":"medium"}]},{"day":3,"title":"اليوم الثالث","activities":[{"time":"09:00","period":"صباحًا","activity":"مركز الملك عبدالعزيز التاريخي","description":"مجمع ثقافي (متحف/حدائق) مناسب لنصف يوم خفيف.","type":"تراث","category":"تراث","duration":"120 دقيقة","cost":"0.00","budgetLevel":"low"},{"time":"12:00","period":"ظهرًا","activity":"حي الطريف بالدرعية","description":"موقع تراث عالمي وممشى ثقافي—الأفضل عصرًا قبل العشاء.","type":"تراث","category":"تراث","duration":"150 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"15:00","period":"عصرًا","activity":"أنجلينا (البجيري)","description":"حلويات/قهوة ضمن مطل البجيري—مناسب بعد العشاء.","type":"مطاعم","category":"مطاعم","duration":"60 دقيقة","cost":"0.00","budgetLevel":"high"},{"time":"18:00","period":"مساءً","activity":"مطل البجيري","description":"وجهة مطاعم بإطلالة على الطريف—ملائمة لميزانية متوسطة إلى عالية.","type":"مطاعم","category":"مطاعم","duration":"120 دقيقة","cost":"0.00","budgetLevel":"high"},{"time":"09:00","period":"صباحًا","activity":"حافة العالم","description":"تجربة طبيعية شهيرة خارج المدينة—تحتاج وقت أطول.","type":"مغامرات","category":"مغامرات","duration":"240 دقيقة","cost":"0.00","budgetLevel":"medium"},{"time":"12:00","period":"ظهرًا","activity":"جسر المشاهدة في برج المملكة","description":"إطلالة بانورامية رائعة، يُفضّل قبل الغروب.","type":"مغامرات","category":"مغامرات","duration":"45 دقيقة","cost":"0.00","budgetLevel":"medium"}]},{"day":4,"title":"اليوم الرابع","activities":[]},{"day":5,"title":"اليوم الخامس","activities":[]}]}	2026-01-18 18:08:10.961791	2026-01-18 18:08:10.961791	\N	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, tier, phone, city, created_at, updated_at, last_signed_in) FROM stdin;
1	mohammed	i7mody507@gmail.com	$2b$10$rrwsDr6yguWWUChXvK.VFe1z58wsoNvu3lAqs//FX0ecmuk2S/3ru	admin	professional	\N	\N	2026-01-16 01:27:26.412013	2026-01-16 01:27:26.412013	2026-01-18 18:04:10.465
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


--
-- Name: accommodations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accommodations_id_seq', 6, true);


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activities_id_seq', 22, true);


--
-- Name: destinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destinations_id_seq', 11, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorites_id_seq', 1, false);


--
-- Name: restaurants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.restaurants_id_seq', 1, false);


--
-- Name: support_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.support_messages_id_seq', 2, true);


--
-- Name: trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trips_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: accommodations accommodations_external_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_external_id_key UNIQUE (external_id);


--
-- Name: accommodations accommodations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_pkey PRIMARY KEY (id);


--
-- Name: activities activities_external_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_external_id_key UNIQUE (external_id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: destinations destinations_external_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_external_id_key UNIQUE (external_id);


--
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- Name: destinations destinations_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_slug_unique UNIQUE (slug);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- Name: support_messages support_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict 3EQgTU51hpmOqjrOX3n2ax6cybzRFoq6kK6QJCtgepCScAY82XsHaxAlAxZ5VZt


--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-08-27 14:44:57

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16435)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    customerid integer NOT NULL,
    customername character varying(100),
    city character varying(50),
    country character varying(50)
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16440)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    productid integer NOT NULL,
    productname character varying(100),
    unitprice numeric(10,2),
    stock integer
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 4894 (class 0 OID 16435)
-- Dependencies: 217
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (customerid, customername, city, country) FROM stdin;
1	Acme Corp	New York	USA
2	Tech Solutions	San Francisco	USA
3	Global Finance Ltd	London	UK
4	InnoSoft	Berlin	Germany
5	FutureVision	Tokyo	Japan
\.


--
-- TOC entry 4895 (class 0 OID 16440)
-- Dependencies: 218
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (productid, productname, unitprice, stock) FROM stdin;
1	Laptop	1200.00	50
2	Smartphone	800.00	150
3	Tablet	600.00	100
4	Monitor	300.00	75
5	Keyboard	50.00	200
\.


--
-- TOC entry 4746 (class 2606 OID 16439)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customerid);


--
-- TOC entry 4748 (class 2606 OID 16444)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (productid);


-- Completed on 2025-08-27 14:44:58

--
-- PostgreSQL database dump complete
--


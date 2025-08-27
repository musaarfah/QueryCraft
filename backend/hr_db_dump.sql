--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-08-27 14:43:59

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
-- TOC entry 218 (class 1259 OID 16410)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    departmentid integer NOT NULL,
    departmentname character varying(50),
    managerid integer
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16405)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    employeeid integer NOT NULL,
    fullname character varying(100),
    department character varying(50),
    jobtitle character varying(50),
    hiredate date,
    salary numeric(10,2)
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16420)
-- Name: salaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salaries (
    salaryid integer NOT NULL,
    employeeid integer,
    basesalary numeric(10,2),
    bonus numeric(10,2),
    effectivedate date
);


ALTER TABLE public.salaries OWNER TO postgres;

--
-- TOC entry 4903 (class 0 OID 16410)
-- Dependencies: 218
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (departmentid, departmentname, managerid) FROM stdin;
1	HR	1
2	IT	4
3	Finance	5
\.


--
-- TOC entry 4902 (class 0 OID 16405)
-- Dependencies: 217
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (employeeid, fullname, department, jobtitle, hiredate, salary) FROM stdin;
1	Alice	HR	HR Manager	2018-03-15	50000.00
2	Bob	IT	Software Engineer	2019-06-10	70000.00
3	Charlie	Finance	Accountant	2020-01-20	60000.00
4	John Carter	IT	Senior Developer	2017-11-05	72000.00
5	Maria Lopez	Finance	Finance Manager	2016-09-25	85000.00
\.


--
-- TOC entry 4904 (class 0 OID 16420)
-- Dependencies: 219
-- Data for Name: salaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salaries (salaryid, employeeid, basesalary, bonus, effectivedate) FROM stdin;
1	1	50000.00	5000.00	2023-01-01
2	2	70000.00	7000.00	2023-01-01
3	3	60000.00	4000.00	2023-01-01
4	4	72000.00	8000.00	2023-01-01
5	5	85000.00	10000.00	2023-01-01
\.


--
-- TOC entry 4752 (class 2606 OID 16414)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (departmentid);


--
-- TOC entry 4750 (class 2606 OID 16409)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employeeid);


--
-- TOC entry 4754 (class 2606 OID 16424)
-- Name: salaries salaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT salaries_pkey PRIMARY KEY (salaryid);


--
-- TOC entry 4755 (class 2606 OID 16415)
-- Name: departments departments_managerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_managerid_fkey FOREIGN KEY (managerid) REFERENCES public.employees(employeeid);


--
-- TOC entry 4756 (class 2606 OID 16425)
-- Name: salaries salaries_employeeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT salaries_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES public.employees(employeeid);


-- Completed on 2025-08-27 14:43:59

--
-- PostgreSQL database dump complete
--


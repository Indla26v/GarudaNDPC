--
-- PostgreSQL database dump
--

\restrict 4HIdQHWlXZhhrO6y6fMc4HmhIEES2G68zERvkkHCVIYCxx02Z12TREK1LaVh3pd

-- Dumped from database version 18.4 (eaf151e)
-- Dumped by pg_dump version 18.4

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

ALTER TABLE ONLY public.village_visits DROP CONSTRAINT village_visits_ps_id_fkey;
ALTER TABLE ONLY public.village_visits DROP CONSTRAINT village_visits_officer_id_fkey;
ALTER TABLE ONLY public.vehicle_checks DROP CONSTRAINT vehicle_checks_ps_id_fkey;
ALTER TABLE ONLY public.vehicle_checks DROP CONSTRAINT vehicle_checks_officer_id_fkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_team_id_fkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_police_station_id_fkey;
ALTER TABLE ONLY public.transaction_records DROP CONSTRAINT transaction_records_offender_id_fkey;
ALTER TABLE ONLY public.transaction_records DROP CONSTRAINT transaction_records_matched_offender_id_fkey;
ALTER TABLE ONLY public.transaction_records DROP CONSTRAINT transaction_records_batch_id_fkey;
ALTER TABLE ONLY public.tower_match_logs DROP CONSTRAINT tower_match_logs_case_id_fkey;
ALTER TABLE ONLY public.surveillance_records DROP CONSTRAINT surveillance_records_verified_by_fkey;
ALTER TABLE ONLY public.surveillance_records DROP CONSTRAINT surveillance_records_offender_id_fkey;
ALTER TABLE ONLY public.supply_chain_links DROP CONSTRAINT supply_chain_links_offender_id_fkey;
ALTER TABLE ONLY public.supply_chain_links DROP CONSTRAINT supply_chain_links_linked_offender_id_fkey;
ALTER TABLE ONLY public.social_media_intel DROP CONSTRAINT social_media_intel_offender_id_fkey;
ALTER TABLE ONLY public.social_media_intel DROP CONSTRAINT social_media_intel_created_by_fkey;
ALTER TABLE ONLY public.seizures DROP CONSTRAINT seizures_case_id_fkey;
ALTER TABLE ONLY public.seized_vehicles DROP CONSTRAINT seized_vehicles_seizure_id_fkey;
ALTER TABLE ONLY public.seized_vehicles DROP CONSTRAINT seized_vehicles_case_id_fkey;
ALTER TABLE ONLY public.rowdy_sheeter_checks DROP CONSTRAINT rowdy_sheeter_checks_ps_id_fkey;
ALTER TABLE ONLY public.rowdy_sheeter_checks DROP CONSTRAINT rowdy_sheeter_checks_officer_id_fkey;
ALTER TABLE ONLY public.refresh_tokens DROP CONSTRAINT refresh_tokens_user_id_fkey;
ALTER TABLE ONLY public.railway_checks DROP CONSTRAINT railway_checks_ps_id_fkey;
ALTER TABLE ONLY public.railway_checks DROP CONSTRAINT railway_checks_officer_id_fkey;
ALTER TABLE ONLY public.petty_cases_checks DROP CONSTRAINT petty_cases_checks_ps_id_fkey;
ALTER TABLE ONLY public.petty_cases_checks DROP CONSTRAINT petty_cases_checks_officer_id_fkey;
ALTER TABLE ONLY public.palle_nidra_checks DROP CONSTRAINT palle_nidra_checks_ps_id_fkey;
ALTER TABLE ONLY public.palle_nidra_checks DROP CONSTRAINT palle_nidra_checks_officer_id_fkey;
ALTER TABLE ONLY public.offenders DROP CONSTRAINT offenders_ps_id_fkey;
ALTER TABLE ONLY public.offenders DROP CONSTRAINT offenders_created_by_fkey;
ALTER TABLE ONLY public.offender_identity_docs DROP CONSTRAINT offender_identity_docs_offender_id_fkey;
ALTER TABLE ONLY public.offender_financials DROP CONSTRAINT offender_financials_offender_id_fkey;
ALTER TABLE ONLY public.offender_drug_profile DROP CONSTRAINT offender_drug_profile_offender_id_fkey;
ALTER TABLE ONLY public.offender_contacts DROP CONSTRAINT offender_contacts_offender_id_fkey;
ALTER TABLE ONLY public.mv_act_checks DROP CONSTRAINT mv_act_checks_ps_id_fkey;
ALTER TABLE ONLY public.mv_act_checks DROP CONSTRAINT mv_act_checks_officer_id_fkey;
ALTER TABLE ONLY public.messaging_intel DROP CONSTRAINT messaging_intel_offender_id_fkey;
ALTER TABLE ONLY public.messaging_intel DROP CONSTRAINT messaging_intel_created_by_fkey;
ALTER TABLE ONLY public.lodge_checks DROP CONSTRAINT lodge_checks_ps_id_fkey;
ALTER TABLE ONLY public.lodge_checks DROP CONSTRAINT lodge_checks_officer_id_fkey;
ALTER TABLE ONLY public.interrogation_sessions DROP CONSTRAINT interrogation_sessions_officer_id_fkey;
ALTER TABLE ONLY public.interrogation_sessions DROP CONSTRAINT interrogation_sessions_offender_id_fkey;
ALTER TABLE ONLY public.interrogation_sessions DROP CONSTRAINT interrogation_sessions_case_id_fkey;
ALTER TABLE ONLY public.intelligence_inputs DROP CONSTRAINT intelligence_inputs_ps_id_fkey;
ALTER TABLE ONLY public.intelligence_inputs DROP CONSTRAINT intelligence_inputs_offender_id_fkey;
ALTER TABLE ONLY public.intelligence_inputs DROP CONSTRAINT intelligence_inputs_informer_id_fkey;
ALTER TABLE ONLY public.intelligence_inputs DROP CONSTRAINT intelligence_inputs_created_by_fkey;
ALTER TABLE ONLY public.informers DROP CONSTRAINT informers_created_by_fkey;
ALTER TABLE ONLY public.imei_records DROP CONSTRAINT imei_records_offender_id_fkey;
ALTER TABLE ONLY public.imei_records DROP CONSTRAINT imei_records_created_by_fkey;
ALTER TABLE ONLY public.finance_upload_batches DROP CONSTRAINT finance_upload_batches_uploaded_by_fkey;
ALTER TABLE ONLY public.finance_upload_batches DROP CONSTRAINT finance_upload_batches_offender_id_fkey;
ALTER TABLE ONLY public.enforcement_checks DROP CONSTRAINT enforcement_checks_reviewed_by_fkey;
ALTER TABLE ONLY public.enforcement_checks DROP CONSTRAINT enforcement_checks_ps_id_fkey;
ALTER TABLE ONLY public.enforcement_checks DROP CONSTRAINT enforcement_checks_matched_offender_id_fkey;
ALTER TABLE ONLY public.enforcement_checks DROP CONSTRAINT enforcement_checks_created_by_fkey;
ALTER TABLE ONLY public.enforcement_checks DROP CONSTRAINT enforcement_checks_committed_offender_id_fkey;
ALTER TABLE ONLY public.edit_requests DROP CONSTRAINT edit_requests_requested_by_fkey;
ALTER TABLE ONLY public.edit_requests DROP CONSTRAINT edit_requests_approved_by_fkey;
ALTER TABLE ONLY public.drunk_drive_checks DROP CONSTRAINT drunk_drive_checks_ps_id_fkey;
ALTER TABLE ONLY public.drunk_drive_checks DROP CONSTRAINT drunk_drive_checks_officer_id_fkey;
ALTER TABLE ONLY public.drone_surveillance_checks DROP CONSTRAINT drone_surveillance_checks_ps_id_fkey;
ALTER TABLE ONLY public.drone_surveillance_checks DROP CONSTRAINT drone_surveillance_checks_officer_id_fkey;
ALTER TABLE ONLY public.deletion_requests DROP CONSTRAINT deletion_requests_requested_by_fkey;
ALTER TABLE ONLY public.deletion_requests DROP CONSTRAINT deletion_requests_flagged_by_fkey;
ALTER TABLE ONLY public.deletion_requests DROP CONSTRAINT deletion_requests_escalated_by_fkey;
ALTER TABLE ONLY public.deletion_requests DROP CONSTRAINT deletion_requests_deleted_by_fkey;
ALTER TABLE ONLY public.deletion_requests DROP CONSTRAINT deletion_requests_approved_by_fkey;
ALTER TABLE ONLY public.court_hearings DROP CONSTRAINT court_hearings_case_id_fkey;
ALTER TABLE ONLY public.courier_checks DROP CONSTRAINT courier_checks_ps_id_fkey;
ALTER TABLE ONLY public.courier_checks DROP CONSTRAINT courier_checks_officer_id_fkey;
ALTER TABLE ONLY public.charge_sheets DROP CONSTRAINT charge_sheets_case_id_fkey;
ALTER TABLE ONLY public.cases DROP CONSTRAINT cases_ps_id_fkey;
ALTER TABLE ONLY public.cases DROP CONSTRAINT cases_created_by_fkey;
ALTER TABLE ONLY public.case_accused DROP CONSTRAINT case_accused_previous_ps_id_fkey;
ALTER TABLE ONLY public.case_accused DROP CONSTRAINT case_accused_offender_id_fkey;
ALTER TABLE ONLY public.case_accused DROP CONSTRAINT case_accused_case_id_fkey;
ALTER TABLE ONLY public.bus_stand_checks DROP CONSTRAINT bus_stand_checks_ps_id_fkey;
ALTER TABLE ONLY public.bus_stand_checks DROP CONSTRAINT bus_stand_checks_officer_id_fkey;
ALTER TABLE ONLY public.bound_over_checks DROP CONSTRAINT bound_over_checks_ps_id_fkey;
ALTER TABLE ONLY public.bound_over_checks DROP CONSTRAINT bound_over_checks_officer_id_fkey;
ALTER TABLE ONLY public.bail_records DROP CONSTRAINT bail_records_case_id_fkey;
ALTER TABLE ONLY public.bail_records DROP CONSTRAINT bail_records_case_accused_id_fkey;
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;
DROP INDEX public.users_username_key;
DROP INDEX public.teams_name_key;
DROP INDEX public.refresh_tokens_token_key;
DROP INDEX public.police_stations_ps_code_key;
DROP INDEX public.offender_drug_profile_offender_id_key;
DROP INDEX public.informers_code_name_key;
DROP INDEX public.idx_vv_ps;
DROP INDEX public.idx_vv_officer;
DROP INDEX public.idx_vv_date;
DROP INDEX public.idx_vc_ps;
DROP INDEX public.idx_vc_officer;
DROP INDEX public.idx_vc_date;
DROP INDEX public.idx_users_team;
DROP INDEX public.idx_users_role;
DROP INDEX public.idx_users_ps;
DROP INDEX public.idx_users_dept;
DROP INDEX public.idx_txn_offender;
DROP INDEX public.idx_txn_matched;
DROP INDEX public.idx_txn_flagged;
DROP INDEX public.idx_txn_date;
DROP INDEX public.idx_txn_cp_account;
DROP INDEX public.idx_txn_batch;
DROP INDEX public.idx_txn_amount;
DROP INDEX public.idx_tml_time;
DROP INDEX public.idx_tml_mobile;
DROP INDEX public.idx_tml_case;
DROP INDEX public.idx_sv_status;
DROP INDEX public.idx_sv_reg;
DROP INDEX public.idx_sv_case;
DROP INDEX public.idx_sr_verified_by;
DROP INDEX public.idx_sr_status;
DROP INDEX public.idx_sr_offender;
DROP INDEX public.idx_sr_date;
DROP INDEX public.idx_smi_platform;
DROP INDEX public.idx_smi_offender;
DROP INDEX public.idx_seizures_case;
DROP INDEX public.idx_scl_type;
DROP INDEX public.idx_scl_offender;
DROP INDEX public.idx_scl_linked;
DROP INDEX public.idx_rt_user;
DROP INDEX public.idx_rt_token;
DROP INDEX public.idx_rs_ps;
DROP INDEX public.idx_rs_officer;
DROP INDEX public.idx_rs_date;
DROP INDEX public.idx_rc_ps;
DROP INDEX public.idx_rc_officer;
DROP INDEX public.idx_rc_date;
DROP INDEX public.idx_ps_district;
DROP INDEX public.idx_pn_ps;
DROP INDEX public.idx_pn_officer;
DROP INDEX public.idx_pn_date;
DROP INDEX public.idx_pc_ps;
DROP INDEX public.idx_pc_officer;
DROP INDEX public.idx_pc_date;
DROP INDEX public.idx_oid_offender;
DROP INDEX public.idx_oid_aadhaar;
DROP INDEX public.idx_offenders_status;
DROP INDEX public.idx_offenders_risk;
DROP INDEX public.idx_offenders_ps;
DROP INDEX public.idx_offenders_name;
DROP INDEX public.idx_offenders_district;
DROP INDEX public.idx_offenders_category;
DROP INDEX public.idx_offenders_alias;
DROP INDEX public.idx_of_type;
DROP INDEX public.idx_of_offender;
DROP INDEX public.idx_odp_offender;
DROP INDEX public.idx_oc_value;
DROP INDEX public.idx_oc_type;
DROP INDEX public.idx_oc_offender;
DROP INDEX public.idx_mv_ps;
DROP INDEX public.idx_mv_officer;
DROP INDEX public.idx_mv_date;
DROP INDEX public.idx_msi_source;
DROP INDEX public.idx_msi_offender;
DROP INDEX public.idx_lc_ps;
DROP INDEX public.idx_lc_officer;
DROP INDEX public.idx_lc_date;
DROP INDEX public.idx_is_offender;
DROP INDEX public.idx_is_case;
DROP INDEX public.idx_inf_status;
DROP INDEX public.idx_inf_created_by;
DROP INDEX public.idx_imei_offender;
DROP INDEX public.idx_imei_number;
DROP INDEX public.idx_imei_mobile;
DROP INDEX public.idx_ii_source;
DROP INDEX public.idx_ii_ps;
DROP INDEX public.idx_ii_offender;
DROP INDEX public.idx_ii_informer;
DROP INDEX public.idx_ii_created_by;
DROP INDEX public.idx_fub_uploader;
DROP INDEX public.idx_fub_status;
DROP INDEX public.idx_fub_offender;
DROP INDEX public.idx_fub_month;
DROP INDEX public.idx_er_status;
DROP INDEX public.idx_er_requested_by;
DROP INDEX public.idx_er_entity;
DROP INDEX public.idx_ec_status;
DROP INDEX public.idx_ec_result;
DROP INDEX public.idx_ec_ps;
DROP INDEX public.idx_ec_created_by;
DROP INDEX public.idx_ec_created_at;
DROP INDEX public.idx_ds_ps;
DROP INDEX public.idx_ds_officer;
DROP INDEX public.idx_ds_date;
DROP INDEX public.idx_dr_status;
DROP INDEX public.idx_dr_flagged_by;
DROP INDEX public.idx_dr_entity;
DROP INDEX public.idx_div_district;
DROP INDEX public.idx_dd_ps;
DROP INDEX public.idx_dd_officer;
DROP INDEX public.idx_dd_date;
DROP INDEX public.idx_cs_case;
DROP INDEX public.idx_ch_next;
DROP INDEX public.idx_ch_case;
DROP INDEX public.idx_cc_ps;
DROP INDEX public.idx_cc_officer;
DROP INDEX public.idx_cc_date;
DROP INDEX public.idx_cases_stage;
DROP INDEX public.idx_cases_ps;
DROP INDEX public.idx_cases_fir;
DROP INDEX public.idx_cases_date;
DROP INDEX public.idx_cases_contraband;
DROP INDEX public.idx_ca_offender;
DROP INDEX public.idx_ca_case;
DROP INDEX public.idx_br_case;
DROP INDEX public.idx_bo_ps;
DROP INDEX public.idx_bo_officer;
DROP INDEX public.idx_bo_date;
DROP INDEX public.idx_bc_ps;
DROP INDEX public.idx_bc_officer;
DROP INDEX public.idx_bc_date;
DROP INDEX public.idx_audit_user;
DROP INDEX public.idx_audit_timestamp;
DROP INDEX public.idx_audit_entity;
DROP INDEX public.idx_audit_action;
DROP INDEX public.flyway_schema_history_s_idx;
DROP INDEX public.divisions_name_key;
DROP INDEX public.divisions_code_key;
DROP INDEX public.districts_name_key;
DROP INDEX public.charge_sheets_case_id_key;
DROP INDEX public.case_accused_case_id_offender_id_key;
ALTER TABLE ONLY public.village_visits DROP CONSTRAINT village_visits_pkey;
ALTER TABLE ONLY public.vehicle_checks DROP CONSTRAINT vehicle_checks_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.transaction_records DROP CONSTRAINT transaction_records_pkey;
ALTER TABLE ONLY public.tower_match_logs DROP CONSTRAINT tower_match_logs_pkey;
ALTER TABLE ONLY public.teams DROP CONSTRAINT teams_pkey;
ALTER TABLE ONLY public.system_settings DROP CONSTRAINT system_settings_pkey;
ALTER TABLE ONLY public.surveillance_records DROP CONSTRAINT surveillance_records_pkey;
ALTER TABLE ONLY public.supply_chain_links DROP CONSTRAINT supply_chain_links_pkey;
ALTER TABLE ONLY public.social_media_intel DROP CONSTRAINT social_media_intel_pkey;
ALTER TABLE ONLY public.seizures DROP CONSTRAINT seizures_pkey;
ALTER TABLE ONLY public.seized_vehicles DROP CONSTRAINT seized_vehicles_pkey;
ALTER TABLE ONLY public.rowdy_sheeter_checks DROP CONSTRAINT rowdy_sheeter_checks_pkey;
ALTER TABLE ONLY public.refresh_tokens DROP CONSTRAINT refresh_tokens_pkey;
ALTER TABLE ONLY public.railway_checks DROP CONSTRAINT railway_checks_pkey;
ALTER TABLE ONLY public.police_stations DROP CONSTRAINT police_stations_pkey;
ALTER TABLE ONLY public.petty_cases_checks DROP CONSTRAINT petty_cases_checks_pkey;
ALTER TABLE ONLY public.palle_nidra_checks DROP CONSTRAINT palle_nidra_checks_pkey;
ALTER TABLE ONLY public.offenders DROP CONSTRAINT offenders_pkey;
ALTER TABLE ONLY public.offender_identity_docs DROP CONSTRAINT offender_identity_docs_pkey;
ALTER TABLE ONLY public.offender_financials DROP CONSTRAINT offender_financials_pkey;
ALTER TABLE ONLY public.offender_drug_profile DROP CONSTRAINT offender_drug_profile_pkey;
ALTER TABLE ONLY public.offender_contacts DROP CONSTRAINT offender_contacts_pkey;
ALTER TABLE ONLY public.mv_act_checks DROP CONSTRAINT mv_act_checks_pkey;
ALTER TABLE ONLY public.messaging_intel DROP CONSTRAINT messaging_intel_pkey;
ALTER TABLE ONLY public.lodge_checks DROP CONSTRAINT lodge_checks_pkey;
ALTER TABLE ONLY public.interrogation_sessions DROP CONSTRAINT interrogation_sessions_pkey;
ALTER TABLE ONLY public.intelligence_inputs DROP CONSTRAINT intelligence_inputs_pkey;
ALTER TABLE ONLY public.informers DROP CONSTRAINT informers_pkey;
ALTER TABLE ONLY public.imei_records DROP CONSTRAINT imei_records_pkey;
ALTER TABLE ONLY public.flyway_schema_history DROP CONSTRAINT flyway_schema_history_pk;
ALTER TABLE ONLY public.finance_upload_batches DROP CONSTRAINT finance_upload_batches_pkey;
ALTER TABLE ONLY public.enforcement_checks DROP CONSTRAINT enforcement_checks_pkey;
ALTER TABLE ONLY public.edit_requests DROP CONSTRAINT edit_requests_pkey;
ALTER TABLE ONLY public.drunk_drive_checks DROP CONSTRAINT drunk_drive_checks_pkey;
ALTER TABLE ONLY public.drone_surveillance_checks DROP CONSTRAINT drone_surveillance_checks_pkey;
ALTER TABLE ONLY public.divisions DROP CONSTRAINT divisions_pkey;
ALTER TABLE ONLY public.districts DROP CONSTRAINT districts_pkey;
ALTER TABLE ONLY public.deletion_requests DROP CONSTRAINT deletion_requests_pkey;
ALTER TABLE ONLY public.court_hearings DROP CONSTRAINT court_hearings_pkey;
ALTER TABLE ONLY public.courier_checks DROP CONSTRAINT courier_checks_pkey;
ALTER TABLE ONLY public.charge_sheets DROP CONSTRAINT charge_sheets_pkey;
ALTER TABLE ONLY public.cases DROP CONSTRAINT cases_pkey;
ALTER TABLE ONLY public.case_accused DROP CONSTRAINT case_accused_pkey;
ALTER TABLE ONLY public.bus_stand_checks DROP CONSTRAINT bus_stand_checks_pkey;
ALTER TABLE ONLY public.bound_over_checks DROP CONSTRAINT bound_over_checks_pkey;
ALTER TABLE ONLY public.bail_records DROP CONSTRAINT bail_records_pkey;
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT audit_logs_pkey;
ALTER TABLE public.village_visits ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.vehicle_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.transaction_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.tower_match_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.teams ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.surveillance_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.supply_chain_links ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.social_media_intel ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.seizures ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.seized_vehicles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.rowdy_sheeter_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.refresh_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.railway_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.police_stations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.petty_cases_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.palle_nidra_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.offenders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.offender_identity_docs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.offender_financials ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.offender_drug_profile ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.offender_contacts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.mv_act_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.messaging_intel ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.lodge_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.interrogation_sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.intelligence_inputs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.informers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.imei_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.finance_upload_batches ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.enforcement_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.edit_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.drunk_drive_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.drone_surveillance_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.divisions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.districts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.deletion_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.court_hearings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.courier_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.charge_sheets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.cases ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.case_accused ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.bus_stand_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.bound_over_checks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.bail_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.audit_logs ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.village_visits_id_seq;
DROP TABLE public.village_visits;
DROP SEQUENCE public.vehicle_checks_id_seq;
DROP TABLE public.vehicle_checks;
DROP SEQUENCE public.users_id_seq;
DROP TABLE public.users;
DROP SEQUENCE public.transaction_records_id_seq;
DROP TABLE public.transaction_records;
DROP SEQUENCE public.tower_match_logs_id_seq;
DROP TABLE public.tower_match_logs;
DROP SEQUENCE public.teams_id_seq;
DROP TABLE public.teams;
DROP TABLE public.system_settings;
DROP SEQUENCE public.surveillance_records_id_seq;
DROP TABLE public.surveillance_records;
DROP SEQUENCE public.supply_chain_links_id_seq;
DROP TABLE public.supply_chain_links;
DROP SEQUENCE public.social_media_intel_id_seq;
DROP TABLE public.social_media_intel;
DROP SEQUENCE public.seizures_id_seq;
DROP TABLE public.seizures;
DROP SEQUENCE public.seized_vehicles_id_seq;
DROP TABLE public.seized_vehicles;
DROP SEQUENCE public.rowdy_sheeter_checks_id_seq;
DROP TABLE public.rowdy_sheeter_checks;
DROP SEQUENCE public.refresh_tokens_id_seq;
DROP TABLE public.refresh_tokens;
DROP SEQUENCE public.railway_checks_id_seq;
DROP TABLE public.railway_checks;
DROP SEQUENCE public.police_stations_id_seq;
DROP TABLE public.police_stations;
DROP SEQUENCE public.petty_cases_checks_id_seq;
DROP TABLE public.petty_cases_checks;
DROP SEQUENCE public.palle_nidra_checks_id_seq;
DROP TABLE public.palle_nidra_checks;
DROP SEQUENCE public.offenders_id_seq;
DROP TABLE public.offenders;
DROP SEQUENCE public.offender_identity_docs_id_seq;
DROP TABLE public.offender_identity_docs;
DROP SEQUENCE public.offender_financials_id_seq;
DROP TABLE public.offender_financials;
DROP SEQUENCE public.offender_drug_profile_id_seq;
DROP TABLE public.offender_drug_profile;
DROP SEQUENCE public.offender_contacts_id_seq;
DROP TABLE public.offender_contacts;
DROP SEQUENCE public.mv_act_checks_id_seq;
DROP TABLE public.mv_act_checks;
DROP SEQUENCE public.messaging_intel_id_seq;
DROP TABLE public.messaging_intel;
DROP SEQUENCE public.lodge_checks_id_seq;
DROP TABLE public.lodge_checks;
DROP SEQUENCE public.interrogation_sessions_id_seq;
DROP TABLE public.interrogation_sessions;
DROP SEQUENCE public.intelligence_inputs_id_seq;
DROP TABLE public.intelligence_inputs;
DROP SEQUENCE public.informers_id_seq;
DROP TABLE public.informers;
DROP SEQUENCE public.imei_records_id_seq;
DROP TABLE public.imei_records;
DROP TABLE public.flyway_schema_history;
DROP SEQUENCE public.finance_upload_batches_id_seq;
DROP TABLE public.finance_upload_batches;
DROP SEQUENCE public.enforcement_checks_id_seq;
DROP TABLE public.enforcement_checks;
DROP SEQUENCE public.edit_requests_id_seq;
DROP TABLE public.edit_requests;
DROP SEQUENCE public.drunk_drive_checks_id_seq;
DROP TABLE public.drunk_drive_checks;
DROP SEQUENCE public.drone_surveillance_checks_id_seq;
DROP TABLE public.drone_surveillance_checks;
DROP SEQUENCE public.divisions_id_seq;
DROP TABLE public.divisions;
DROP SEQUENCE public.districts_id_seq;
DROP TABLE public.districts;
DROP SEQUENCE public.deletion_requests_id_seq;
DROP TABLE public.deletion_requests;
DROP SEQUENCE public.court_hearings_id_seq;
DROP TABLE public.court_hearings;
DROP SEQUENCE public.courier_checks_id_seq;
DROP TABLE public.courier_checks;
DROP SEQUENCE public.charge_sheets_id_seq;
DROP TABLE public.charge_sheets;
DROP SEQUENCE public.cases_id_seq;
DROP TABLE public.cases;
DROP SEQUENCE public.case_accused_id_seq;
DROP TABLE public.case_accused;
DROP SEQUENCE public.bus_stand_checks_id_seq;
DROP TABLE public.bus_stand_checks;
DROP SEQUENCE public.bound_over_checks_id_seq;
DROP TABLE public.bound_over_checks;
DROP SEQUENCE public.bail_records_id_seq;
DROP TABLE public.bail_records;
DROP SEQUENCE public.audit_logs_id_seq;
DROP TABLE public.audit_logs;
DROP TYPE public.verification_status;
DROP TYPE public.user_role;
DROP TYPE public.upload_status;
DROP TYPE public.txn_mode;
DROP TYPE public.txn_direction;
DROP TYPE public.test_result;
DROP TYPE public.supply_link_type;
DROP TYPE public.station_type;
DROP TYPE public.source_type;
DROP TYPE public.source_of_procurement;
DROP TYPE public.risk_score;
DROP TYPE public.quantity_unit;
DROP TYPE public.purchase_mode;
DROP TYPE public.offender_status;
DROP TYPE public.offender_category;
DROP TYPE public.intel_source;
DROP TYPE public.intel_rating;
DROP TYPE public.imei_status;
DROP TYPE public.gender_type;
DROP TYPE public.fin_type;
DROP TYPE public.enforcement_test_result;
DROP TYPE public.enforcement_status;
DROP TYPE public.edit_request_status;
DROP TYPE public.department_type;
DROP TYPE public.deletion_request_status;
DROP TYPE public.contraband_type;
DROP TYPE public.contact_type;
DROP TYPE public.consumption_frequency;
DROP TYPE public.case_stage;
DROP TYPE public.case_department;
DROP TYPE public.bail_status;
DROP TYPE public.audit_action;
DROP TYPE public.arrest_status;
DROP TYPE public.addiction_type;
--
-- Name: addiction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.addiction_type AS ENUM (
    'GANJA_ONLY',
    'GANJA_ALCOHOL',
    'GANJA_OTHER_DRUGS',
    'MULTIPLE'
);


--
-- Name: arrest_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.arrest_status AS ENUM (
    'ARRESTED',
    'ABSCONDING',
    'BAILED'
);


--
-- Name: audit_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audit_action AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'VIEW',
    'EXPORT',
    'LOGIN',
    'LOGOUT',
    'DELETION_FLAGGED',
    'DELETION_ESCALATED',
    'DELETION_REQUESTED',
    'DELETION_APPROVED',
    'DELETION_EXECUTED',
    'DELETION_REJECTED',
    'EDIT_REQUESTED',
    'EDIT_APPROVED',
    'EDIT_REJECTED'
);


--
-- Name: bail_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.bail_status AS ENUM (
    'PENDING',
    'GRANTED',
    'REJECTED',
    'CANCELLED'
);


--
-- Name: case_department; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.case_department AS ENUM (
    'POLICE',
    'EXCISE'
);


--
-- Name: case_stage; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.case_stage AS ENUM (
    'FIR',
    'CHARGESHEET',
    'TRIAL',
    'CONVICTED',
    'ACQUITTED',
    'CLOSED'
);


--
-- Name: consumption_frequency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.consumption_frequency AS ENUM (
    'DAILY',
    'WEEKLY',
    'OCCASIONAL'
);


--
-- Name: contact_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contact_type AS ENUM (
    'MOBILE_PRIMARY',
    'MOBILE_SECONDARY',
    'MOBILE_SIBLING',
    'GMAIL',
    'WHATSAPP',
    'TELEGRAM',
    'INSTAGRAM',
    'FACEBOOK',
    'OTHER_SOCIAL'
);


--
-- Name: contraband_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contraband_type AS ENUM (
    'DRY_GANJA',
    'GANJA_OIL',
    'BROWN_SUGAR',
    'HEROIN',
    'MDMA',
    'SYNTHETIC',
    'COCAINE',
    'OPIUM',
    'OTHER'
);


--
-- Name: deletion_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.deletion_request_status AS ENUM (
    'FLAGGED',
    'ESCALATED',
    'REQUESTED',
    'APPROVED',
    'DELETED',
    'REJECTED'
);


--
-- Name: department_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.department_type AS ENUM (
    'POLICE',
    'CYBER_ANALYTICS',
    'EXCISE'
);


--
-- Name: edit_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.edit_request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: enforcement_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enforcement_status AS ENUM (
    'FIELD_CREATED',
    'NEGATIVE_CLOSED',
    'PENDING_SHO_REVIEW',
    'SHO_APPROVED',
    'SHO_REJECTED'
);


--
-- Name: enforcement_test_result; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enforcement_test_result AS ENUM (
    'PENDING',
    'POSITIVE',
    'NEGATIVE'
);


--
-- Name: fin_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.fin_type AS ENUM (
    'UPI_ID',
    'UPI_LINKED_MOBILE',
    'BANK_NAME',
    'BANK_ACCOUNT_NO',
    'IFSC_CODE',
    'ATM_CARD'
);


--
-- Name: gender_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gender_type AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


--
-- Name: imei_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.imei_status AS ENUM (
    'ACTIVE',
    'SWAPPED',
    'DEACTIVATED',
    'SUSPICIOUS'
);


--
-- Name: intel_rating; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.intel_rating AS ENUM (
    'CONFIRMED',
    'PROBABLE',
    'UNVERIFIED'
);


--
-- Name: intel_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.intel_source AS ENUM (
    'INFORMER',
    'TIP_OFF',
    'INTERCEPT'
);


--
-- Name: offender_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.offender_category AS ENUM (
    'CONSUMER',
    'LOCAL_PEDDLER',
    'SUPPLIER',
    'LOCAL_KINGPIN',
    'TRANSPORTER',
    'INTERSTATE_LINK',
    'FINANCIER'
);


--
-- Name: offender_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.offender_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ABSCONDING',
    'ARRESTED',
    'BAILED'
);


--
-- Name: purchase_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.purchase_mode AS ENUM (
    'CASH',
    'UPI',
    'CREDIT',
    'BARTER',
    'MIXED'
);


--
-- Name: quantity_unit; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quantity_unit AS ENUM (
    'KG',
    'GRAMS',
    'ML',
    'TABLETS',
    'STRIPS',
    'PACKETS'
);


--
-- Name: risk_score; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.risk_score AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


--
-- Name: source_of_procurement; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.source_of_procurement AS ENUM (
    'LOCAL',
    'OUTSIDE_DISTRICT',
    'ONLINE',
    'COURIER'
);


--
-- Name: source_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.source_type AS ENUM (
    'INFORMER',
    'FIELD_OFFICER',
    'SB',
    'EXCISE',
    'OTHER'
);


--
-- Name: station_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.station_type AS ENUM (
    'POLICE',
    'EXCISE'
);


--
-- Name: supply_link_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.supply_link_type AS ENUM (
    'CO_CONSUMER',
    'PEDDLER',
    'SUPPLIER',
    'TRANSPORTER',
    'KINGPIN'
);


--
-- Name: test_result; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.test_result AS ENUM (
    'POSITIVE',
    'NEGATIVE',
    'PENDING'
);


--
-- Name: txn_direction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.txn_direction AS ENUM (
    'INCOMING',
    'OUTGOING'
);


--
-- Name: txn_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.txn_mode AS ENUM (
    'BANK',
    'UPI',
    'CASH',
    'WALLET',
    'NEFT',
    'RTGS',
    'IMPS'
);


--
-- Name: upload_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.upload_status AS ENUM (
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'PARTIAL'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'SP',
    'ASP',
    'SDPO',
    'SHO',
    'CONSTABLE'
);


--
-- Name: verification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.verification_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'MISSED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    user_id bigint,
    action public.audit_action NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id bigint,
    ip_address character varying(45),
    user_agent character varying(500),
    details text,
    "timestamp" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: bail_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bail_records (
    id bigint NOT NULL,
    case_id bigint NOT NULL,
    case_accused_id bigint,
    application_date date,
    status public.bail_status DEFAULT 'PENDING'::public.bail_status NOT NULL,
    granted_date date,
    court_name character varying(200),
    surety_details text,
    conditions text,
    cancelled_at timestamp(6) without time zone,
    notes text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: bail_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bail_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bail_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bail_records_id_seq OWNED BY public.bail_records.id;


--
-- Name: bound_over_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bound_over_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    subject_name character varying(200) NOT NULL,
    bound_over_date date,
    expiry_date date,
    court_order_no character varying(100),
    compliance_status character varying(50),
    violation_details text,
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    findings_notes text,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: bound_over_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bound_over_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bound_over_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bound_over_checks_id_seq OWNED BY public.bound_over_checks.id;


--
-- Name: bus_stand_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bus_stand_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    bus_stand_name character varying(200) NOT NULL,
    buses_checked character varying(500),
    passengers_checked integer,
    parcels_verified boolean DEFAULT false NOT NULL,
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    findings_notes text,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: bus_stand_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bus_stand_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bus_stand_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bus_stand_checks_id_seq OWNED BY public.bus_stand_checks.id;


--
-- Name: case_accused; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_accused (
    id bigint NOT NULL,
    case_id bigint NOT NULL,
    offender_id bigint NOT NULL,
    previous_cr_no character varying(50),
    previous_ps_id bigint,
    arrest_status public.arrest_status DEFAULT 'ARRESTED'::public.arrest_status NOT NULL,
    arrest_date date,
    bail_date date,
    bail_conditions text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: case_accused_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.case_accused_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: case_accused_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.case_accused_id_seq OWNED BY public.case_accused.id;


--
-- Name: cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cases (
    id bigint NOT NULL,
    fir_no character varying(50) NOT NULL,
    ps_id bigint NOT NULL,
    section_of_law character varying(300),
    case_date date,
    stage public.case_stage DEFAULT 'FIR'::public.case_stage NOT NULL,
    nature_of_offence character varying(500),
    contraband_type public.contraband_type,
    quantity numeric(12,3),
    quantity_unit public.quantity_unit,
    street_value numeric(15,2),
    source_location character varying(300),
    destination_location character varying(300),
    intelligence_notes text,
    department public.case_department DEFAULT 'POLICE'::public.case_department NOT NULL,
    created_by bigint,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_history_sheet boolean DEFAULT false NOT NULL,
    is_rowdy_sheet boolean DEFAULT false NOT NULL,
    relevant_files character varying(1000),
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cases_id_seq OWNED BY public.cases.id;


--
-- Name: charge_sheets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.charge_sheets (
    id bigint NOT NULL,
    case_id bigint NOT NULL,
    expected_submission_date date,
    actual_submission_date date,
    missing_documents text,
    prosecutor_name character varying(200),
    notes text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: charge_sheets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.charge_sheets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: charge_sheets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.charge_sheets_id_seq OWNED BY public.charge_sheets.id;


--
-- Name: courier_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courier_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    courier_office_name character varying(200) NOT NULL,
    location character varying(300),
    manager_name character varying(200),
    checked_register boolean DEFAULT false NOT NULL,
    checked_suspicious_parcels boolean DEFAULT false NOT NULL,
    scanned_parcels_count integer,
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    findings_notes text,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: courier_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.courier_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courier_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.courier_checks_id_seq OWNED BY public.courier_checks.id;


--
-- Name: court_hearings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.court_hearings (
    id bigint NOT NULL,
    case_id bigint NOT NULL,
    sc_number character varying(100),
    court_name character varying(200),
    hearing_date date,
    judge_name character varying(200),
    order_text text,
    next_hearing_date date,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: court_hearings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.court_hearings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: court_hearings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.court_hearings_id_seq OWNED BY public.court_hearings.id;


--
-- Name: deletion_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deletion_requests (
    id bigint NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id bigint NOT NULL,
    reason text,
    status public.deletion_request_status DEFAULT 'FLAGGED'::public.deletion_request_status NOT NULL,
    flagged_by bigint NOT NULL,
    flagged_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    escalated_by bigint,
    escalated_at timestamp(6) without time zone,
    requested_by bigint,
    requested_at timestamp(6) without time zone,
    approved_by bigint,
    approved_at timestamp(6) without time zone,
    deleted_by bigint,
    deleted_at timestamp(6) without time zone,
    rejection_reason text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: deletion_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.deletion_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: deletion_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.deletion_requests_id_seq OWNED BY public.deletion_requests.id;


--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    state character varying(100) DEFAULT 'Andhra Pradesh'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: districts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.districts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: districts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.districts_id_seq OWNED BY public.districts.id;


--
-- Name: divisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divisions (
    id bigint NOT NULL,
    name character varying(200) NOT NULL,
    code character varying(20) NOT NULL,
    district character varying(100) DEFAULT 'Tirupati'::character varying NOT NULL,
    sdpo_name character varying(200),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: divisions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.divisions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: divisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.divisions_id_seq OWNED BY public.divisions.id;


--
-- Name: drone_surveillance_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drone_surveillance_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    area_name character varying(200) NOT NULL,
    drone_operator character varying(200),
    area_scanned_sqm numeric(10,2),
    ganja_detected boolean DEFAULT false NOT NULL,
    findings_notes text,
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: drone_surveillance_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.drone_surveillance_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: drone_surveillance_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.drone_surveillance_checks_id_seq OWNED BY public.drone_surveillance_checks.id;


--
-- Name: drunk_drive_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drunk_drive_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    vehicle_no character varying(50) NOT NULL,
    driver_name character varying(200) NOT NULL,
    driver_age integer,
    driver_gender character varying(50),
    bac_level numeric(5,2) NOT NULL,
    fine_amount numeric(10,2),
    vehicle_impounded boolean DEFAULT false NOT NULL,
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    remarks text,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: drunk_drive_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.drunk_drive_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: drunk_drive_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.drunk_drive_checks_id_seq OWNED BY public.drunk_drive_checks.id;


--
-- Name: edit_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.edit_requests (
    id bigint NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id bigint NOT NULL,
    changes_json text NOT NULL,
    reason text,
    status public.edit_request_status DEFAULT 'PENDING'::public.edit_request_status NOT NULL,
    requested_by bigint NOT NULL,
    requested_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved_by bigint,
    approved_at timestamp(6) without time zone,
    rejection_reason text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: edit_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.edit_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: edit_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.edit_requests_id_seq OWNED BY public.edit_requests.id;


--
-- Name: enforcement_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enforcement_checks (
    id bigint NOT NULL,
    subject_name character varying(200) NOT NULL,
    subject_age integer,
    subject_gender public.gender_type,
    subject_aadhaar character varying(12),
    photo_url character varying(500),
    place_of_enforcement character varying(500) NOT NULL,
    district character varying(100) DEFAULT 'Tirupati'::character varying NOT NULL,
    ndps_match boolean DEFAULT false NOT NULL,
    matched_offender_id bigint,
    criminal_record_found boolean DEFAULT false NOT NULL,
    lookup_summary text,
    test_result public.enforcement_test_result DEFAULT 'PENDING'::public.enforcement_test_result NOT NULL,
    consumption_type character varying(200),
    status public.enforcement_status DEFAULT 'FIELD_CREATED'::public.enforcement_status NOT NULL,
    created_by bigint NOT NULL,
    ps_id bigint NOT NULL,
    reviewed_by bigint,
    reviewed_at timestamp(6) without time zone,
    review_notes text,
    committed_offender_id bigint,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subject_address text,
    subject_father_name character varying(200),
    subject_landmark character varying(200),
    subject_occupation character varying(100),
    subject_pan character varying(10),
    subject_phone character varying(50),
    geo_lat numeric(10,7),
    geo_lng numeric(10,7)
);


--
-- Name: enforcement_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enforcement_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enforcement_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enforcement_checks_id_seq OWNED BY public.enforcement_checks.id;


--
-- Name: finance_upload_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_upload_batches (
    id bigint NOT NULL,
    uploaded_by bigint NOT NULL,
    offender_id bigint NOT NULL,
    file_name character varying(500) NOT NULL,
    file_type character varying(20) NOT NULL,
    statement_month date NOT NULL,
    bank_name character varying(150),
    account_no character varying(50),
    upi_id character varying(150),
    total_records integer DEFAULT 0 NOT NULL,
    status public.upload_status DEFAULT 'PROCESSING'::public.upload_status NOT NULL,
    error_log text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: finance_upload_batches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finance_upload_batches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finance_upload_batches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finance_upload_batches_id_seq OWNED BY public.finance_upload_batches.id;


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


--
-- Name: imei_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.imei_records (
    id bigint NOT NULL,
    offender_id bigint NOT NULL,
    imei_number character varying(20) NOT NULL,
    device_make character varying(100),
    device_model character varying(100),
    sim_number character varying(30),
    sim_provider character varying(100),
    mobile_number character varying(20),
    status public.imei_status DEFAULT 'ACTIVE'::public.imei_status NOT NULL,
    first_seen timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_seen timestamp(6) without time zone,
    notes text,
    created_by bigint,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: imei_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.imei_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: imei_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.imei_records_id_seq OWNED BY public.imei_records.id;


--
-- Name: informers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.informers (
    id bigint NOT NULL,
    code_name character varying(100) NOT NULL,
    phone character varying(20),
    rating character varying(5),
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: informers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.informers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: informers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.informers_id_seq OWNED BY public.informers.id;


--
-- Name: intelligence_inputs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.intelligence_inputs (
    id bigint NOT NULL,
    offender_id bigint,
    ps_id bigint NOT NULL,
    source_type public.source_type NOT NULL,
    input_text text,
    supply_route text,
    created_by bigint,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    informer_id bigint
);


--
-- Name: intelligence_inputs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.intelligence_inputs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: intelligence_inputs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.intelligence_inputs_id_seq OWNED BY public.intelligence_inputs.id;


--
-- Name: interrogation_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interrogation_sessions (
    id bigint NOT NULL,
    offender_id bigint NOT NULL,
    case_id bigint,
    officer_id bigint,
    session_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    source_info text,
    purchase_price character varying(200),
    selling_price character varying(200),
    delivery_mode character varying(200),
    payment_mode character varying(200),
    network_members text,
    mobiles_disclosed text,
    intel_inputs text,
    notes text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: interrogation_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.interrogation_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: interrogation_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.interrogation_sessions_id_seq OWNED BY public.interrogation_sessions.id;


--
-- Name: lodge_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lodge_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    lodge_name character varying(200) NOT NULL,
    owner_name character varying(200),
    manager_name character varying(200),
    location character varying(300),
    check_date timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    checked_guest_register boolean DEFAULT false NOT NULL,
    verified_foreigners boolean DEFAULT false NOT NULL,
    verified_strangers boolean DEFAULT false NOT NULL,
    verified_suspicious boolean DEFAULT false NOT NULL,
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    findings_notes text,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: lodge_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lodge_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lodge_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lodge_checks_id_seq OWNED BY public.lodge_checks.id;


--
-- Name: messaging_intel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messaging_intel (
    id bigint NOT NULL,
    offender_id bigint NOT NULL,
    platform character varying(50) NOT NULL,
    source_type public.intel_source DEFAULT 'TIP_OFF'::public.intel_source NOT NULL,
    disposition character varying(100),
    input_text text NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: messaging_intel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messaging_intel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messaging_intel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messaging_intel_id_seq OWNED BY public.messaging_intel.id;


--
-- Name: mv_act_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mv_act_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    vehicle_no character varying(50) NOT NULL,
    driver_name character varying(200) NOT NULL,
    violation_type character varying(200) NOT NULL,
    fine_amount numeric(10,2) NOT NULL,
    challan_no character varying(100),
    remarks text,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: mv_act_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mv_act_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mv_act_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mv_act_checks_id_seq OWNED BY public.mv_act_checks.id;


--
-- Name: offender_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offender_contacts (
    id bigint NOT NULL,
    offender_id bigint NOT NULL,
    contact_type public.contact_type NOT NULL,
    value character varying(300) NOT NULL,
    notes text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: offender_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offender_contacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: offender_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.offender_contacts_id_seq OWNED BY public.offender_contacts.id;


--
-- Name: offender_drug_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offender_drug_profile (
    id bigint NOT NULL,
    offender_id bigint NOT NULL,
    addiction_type public.addiction_type,
    consumption_frequency public.consumption_frequency,
    source_of_procurement public.source_of_procurement,
    mode_of_purchase public.purchase_mode,
    usual_consumption_spot character varying(200),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    section_of_law character varying(300)
);


--
-- Name: offender_drug_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offender_drug_profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: offender_drug_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.offender_drug_profile_id_seq OWNED BY public.offender_drug_profile.id;


--
-- Name: offender_financials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offender_financials (
    id bigint NOT NULL,
    offender_id bigint NOT NULL,
    fin_type public.fin_type NOT NULL,
    value character varying(300) NOT NULL,
    bank_name character varying(200),
    notes text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: offender_financials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offender_financials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: offender_financials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.offender_financials_id_seq OWNED BY public.offender_financials.id;


--
-- Name: offender_identity_docs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offender_identity_docs (
    id bigint NOT NULL,
    offender_id bigint NOT NULL,
    aadhaar_no character varying(12),
    voter_id character varying(30),
    pan_card character varying(10),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: offender_identity_docs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offender_identity_docs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: offender_identity_docs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.offender_identity_docs_id_seq OWNED BY public.offender_identity_docs.id;


--
-- Name: offenders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offenders (
    id bigint NOT NULL,
    sl_no character varying(50),
    ps_id bigint NOT NULL,
    full_name character varying(200) NOT NULL,
    alias character varying(200),
    father_husband_name character varying(200),
    age integer,
    gender public.gender_type,
    category public.offender_category,
    full_address text,
    landmark_area character varying(200),
    district character varying(100),
    state character varying(100),
    occupation character varying(100),
    monthly_income numeric(12,2),
    photo_url character varying(500),
    created_by bigint,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    test_result public.test_result,
    status public.offender_status DEFAULT 'ACTIVE'::public.offender_status NOT NULL,
    risk_score public.risk_score,
    caste character varying(100),
    mandal character varying(100)
);


--
-- Name: offenders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offenders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: offenders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.offenders_id_seq OWNED BY public.offenders.id;


--
-- Name: palle_nidra_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.palle_nidra_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    village_name character varying(200) NOT NULL,
    interaction_details text,
    grievances_collected text,
    intel_notes text,
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: palle_nidra_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.palle_nidra_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: palle_nidra_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.palle_nidra_checks_id_seq OWNED BY public.palle_nidra_checks.id;


--
-- Name: petty_cases_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.petty_cases_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    accused_name character varying(200) NOT NULL,
    petty_case_no character varying(100),
    act_section character varying(200) NOT NULL,
    fine_amount numeric(10,2),
    location character varying(300),
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    remarks text,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: petty_cases_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.petty_cases_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: petty_cases_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.petty_cases_checks_id_seq OWNED BY public.petty_cases_checks.id;


--
-- Name: police_stations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.police_stations (
    id bigint NOT NULL,
    name character varying(200) NOT NULL,
    district character varying(100) NOT NULL,
    state character varying(100) DEFAULT 'Andhra Pradesh'::character varying NOT NULL,
    ps_code character varying(20) NOT NULL,
    station_type public.station_type DEFAULT 'POLICE'::public.station_type NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    sdpo character varying(100)
);


--
-- Name: police_stations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.police_stations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: police_stations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.police_stations_id_seq OWNED BY public.police_stations.id;


--
-- Name: railway_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.railway_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    station_name character varying(200) NOT NULL,
    trains_checked character varying(500),
    passengers_profiled integer,
    luggage_inspected_count integer,
    suspicious_luggage_found boolean DEFAULT false NOT NULL,
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    findings_notes text,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: railway_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.railway_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: railway_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.railway_checks_id_seq OWNED BY public.railway_checks.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token character varying(512) NOT NULL,
    expiry_date timestamp(6) without time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: rowdy_sheeter_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rowdy_sheeter_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    rowdy_sheeter_name character varying(200) NOT NULL,
    rowdy_sheet_no character varying(50),
    activity_status character varying(100),
    verification_notes text,
    associates_noted text,
    current_employment character varying(200),
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: rowdy_sheeter_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rowdy_sheeter_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rowdy_sheeter_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rowdy_sheeter_checks_id_seq OWNED BY public.rowdy_sheeter_checks.id;


--
-- Name: seized_vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seized_vehicles (
    id bigint NOT NULL,
    case_id bigint NOT NULL,
    seizure_id bigint,
    vehicle_type character varying(50) NOT NULL,
    registration_no character varying(30) NOT NULL,
    make_model character varying(200),
    color character varying(50),
    chassis_no character varying(100),
    engine_no character varying(100),
    owner_name character varying(200),
    owner_address text,
    seizure_location character varying(300),
    seizure_date date,
    current_status character varying(30) DEFAULT 'SEIZED'::character varying NOT NULL,
    court_order_no character varying(100),
    remarks text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: seized_vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seized_vehicles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seized_vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.seized_vehicles_id_seq OWNED BY public.seized_vehicles.id;


--
-- Name: seizures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seizures (
    id bigint NOT NULL,
    case_id bigint NOT NULL,
    contraband_kg numeric(10,3),
    vehicles_count integer DEFAULT 0 NOT NULL,
    cash_amount numeric(15,2) DEFAULT 0 NOT NULL,
    parcels_count integer DEFAULT 0 NOT NULL,
    other_items text,
    seizure_date date,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: seizures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seizures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seizures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.seizures_id_seq OWNED BY public.seizures.id;


--
-- Name: social_media_intel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_media_intel (
    id bigint NOT NULL,
    offender_id bigint NOT NULL,
    platform character varying(50) NOT NULL,
    handle_or_url character varying(500) NOT NULL,
    rating public.intel_rating DEFAULT 'UNVERIFIED'::public.intel_rating NOT NULL,
    notes text,
    created_by bigint NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: social_media_intel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.social_media_intel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: social_media_intel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.social_media_intel_id_seq OWNED BY public.social_media_intel.id;


--
-- Name: supply_chain_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supply_chain_links (
    id bigint NOT NULL,
    offender_id bigint NOT NULL,
    link_type public.supply_link_type NOT NULL,
    linked_person_name character varying(200),
    linked_person_contact character varying(100),
    linked_offender_id bigint,
    notes text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: supply_chain_links_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supply_chain_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supply_chain_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supply_chain_links_id_seq OWNED BY public.supply_chain_links.id;


--
-- Name: surveillance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.surveillance_records (
    id bigint NOT NULL,
    offender_id bigint NOT NULL,
    scheduled_date date,
    verified_by bigint,
    verification_status public.verification_status DEFAULT 'PENDING'::public.verification_status NOT NULL,
    current_address text,
    current_occupation character varying(200),
    associates_noted text,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    notes text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: surveillance_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.surveillance_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: surveillance_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.surveillance_records_id_seq OWNED BY public.surveillance_records.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    key character varying(100) NOT NULL,
    value text NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id bigint NOT NULL,
    name character varying(200) NOT NULL,
    department public.department_type NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: tower_match_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tower_match_logs (
    id bigint NOT NULL,
    case_id bigint NOT NULL,
    mobile_number character varying(20) NOT NULL,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    hit_time timestamp(6) without time zone NOT NULL,
    cell_tower_id character varying(100) NOT NULL,
    provider character varying(50),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tower_match_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tower_match_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tower_match_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tower_match_logs_id_seq OWNED BY public.tower_match_logs.id;


--
-- Name: transaction_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transaction_records (
    id bigint NOT NULL,
    batch_id bigint NOT NULL,
    offender_id bigint NOT NULL,
    bank_name character varying(150),
    account_no character varying(50),
    upi_id character varying(150),
    transaction_ref character varying(100),
    amount numeric(12,2) NOT NULL,
    txn_date date NOT NULL,
    direction public.txn_direction DEFAULT 'OUTGOING'::public.txn_direction NOT NULL,
    txn_mode public.txn_mode DEFAULT 'BANK'::public.txn_mode NOT NULL,
    counterparty_name character varying(200),
    counterparty_account character varying(100),
    narration character varying(500),
    balance_after numeric(12,2),
    is_flagged boolean DEFAULT false NOT NULL,
    flag_reason character varying(500),
    matched_offender_id bigint,
    notes text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: transaction_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transaction_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transaction_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transaction_records_id_seq OWNED BY public.transaction_records.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(200) NOT NULL,
    role public.user_role NOT NULL,
    department public.department_type DEFAULT 'POLICE'::public.department_type NOT NULL,
    badge_number character varying(50),
    police_station_id bigint,
    division_id character varying(100),
    team_id bigint,
    is_active boolean DEFAULT true NOT NULL,
    last_login timestamp(6) without time zone,
    failed_login_count integer DEFAULT 0 NOT NULL,
    locked_until timestamp(6) without time zone,
    password_changed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    district character varying(100)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicle_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_checks (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    vehicle_no character varying(50) NOT NULL,
    owner_name character varying(200),
    driver_name character varying(200),
    driver_phone character varying(50),
    checked_boot boolean DEFAULT false NOT NULL,
    suspicious_items_found boolean DEFAULT false NOT NULL,
    watchlist_match boolean DEFAULT false NOT NULL,
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    findings_notes text,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: vehicle_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicle_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicle_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicle_checks_id_seq OWNED BY public.vehicle_checks.id;


--
-- Name: village_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.village_visits (
    id bigint NOT NULL,
    ps_id bigint NOT NULL,
    officer_id bigint NOT NULL,
    village_name character varying(200) NOT NULL,
    visit_date timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    verified_bad_chars boolean DEFAULT false NOT NULL,
    verified_rowdies boolean DEFAULT false NOT NULL,
    verified_bound_overs boolean DEFAULT false NOT NULL,
    verified_habitual boolean DEFAULT false NOT NULL,
    interacted_elders boolean DEFAULT false NOT NULL,
    intel_collected boolean DEFAULT false NOT NULL,
    drug_peddler_check boolean DEFAULT false NOT NULL,
    drone_surveillance boolean DEFAULT false NOT NULL,
    vehicle_checking boolean DEFAULT false NOT NULL,
    palle_nidra boolean DEFAULT false NOT NULL,
    no_suspicious_activity boolean DEFAULT false NOT NULL,
    intel_notes text,
    geo_lat numeric(10,7),
    geo_lng numeric(10,7),
    photo_url character varying(500),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: village_visits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.village_visits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: village_visits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.village_visits_id_seq OWNED BY public.village_visits.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: bail_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bail_records ALTER COLUMN id SET DEFAULT nextval('public.bail_records_id_seq'::regclass);


--
-- Name: bound_over_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bound_over_checks ALTER COLUMN id SET DEFAULT nextval('public.bound_over_checks_id_seq'::regclass);


--
-- Name: bus_stand_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_stand_checks ALTER COLUMN id SET DEFAULT nextval('public.bus_stand_checks_id_seq'::regclass);


--
-- Name: case_accused id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_accused ALTER COLUMN id SET DEFAULT nextval('public.case_accused_id_seq'::regclass);


--
-- Name: cases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases ALTER COLUMN id SET DEFAULT nextval('public.cases_id_seq'::regclass);


--
-- Name: charge_sheets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.charge_sheets ALTER COLUMN id SET DEFAULT nextval('public.charge_sheets_id_seq'::regclass);


--
-- Name: courier_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courier_checks ALTER COLUMN id SET DEFAULT nextval('public.courier_checks_id_seq'::regclass);


--
-- Name: court_hearings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.court_hearings ALTER COLUMN id SET DEFAULT nextval('public.court_hearings_id_seq'::regclass);


--
-- Name: deletion_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deletion_requests ALTER COLUMN id SET DEFAULT nextval('public.deletion_requests_id_seq'::regclass);


--
-- Name: districts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts ALTER COLUMN id SET DEFAULT nextval('public.districts_id_seq'::regclass);


--
-- Name: divisions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions ALTER COLUMN id SET DEFAULT nextval('public.divisions_id_seq'::regclass);


--
-- Name: drone_surveillance_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drone_surveillance_checks ALTER COLUMN id SET DEFAULT nextval('public.drone_surveillance_checks_id_seq'::regclass);


--
-- Name: drunk_drive_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drunk_drive_checks ALTER COLUMN id SET DEFAULT nextval('public.drunk_drive_checks_id_seq'::regclass);


--
-- Name: edit_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edit_requests ALTER COLUMN id SET DEFAULT nextval('public.edit_requests_id_seq'::regclass);


--
-- Name: enforcement_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_checks ALTER COLUMN id SET DEFAULT nextval('public.enforcement_checks_id_seq'::regclass);


--
-- Name: finance_upload_batches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_upload_batches ALTER COLUMN id SET DEFAULT nextval('public.finance_upload_batches_id_seq'::regclass);


--
-- Name: imei_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imei_records ALTER COLUMN id SET DEFAULT nextval('public.imei_records_id_seq'::regclass);


--
-- Name: informers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.informers ALTER COLUMN id SET DEFAULT nextval('public.informers_id_seq'::regclass);


--
-- Name: intelligence_inputs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_inputs ALTER COLUMN id SET DEFAULT nextval('public.intelligence_inputs_id_seq'::regclass);


--
-- Name: interrogation_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interrogation_sessions ALTER COLUMN id SET DEFAULT nextval('public.interrogation_sessions_id_seq'::regclass);


--
-- Name: lodge_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lodge_checks ALTER COLUMN id SET DEFAULT nextval('public.lodge_checks_id_seq'::regclass);


--
-- Name: messaging_intel id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messaging_intel ALTER COLUMN id SET DEFAULT nextval('public.messaging_intel_id_seq'::regclass);


--
-- Name: mv_act_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mv_act_checks ALTER COLUMN id SET DEFAULT nextval('public.mv_act_checks_id_seq'::regclass);


--
-- Name: offender_contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_contacts ALTER COLUMN id SET DEFAULT nextval('public.offender_contacts_id_seq'::regclass);


--
-- Name: offender_drug_profile id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_drug_profile ALTER COLUMN id SET DEFAULT nextval('public.offender_drug_profile_id_seq'::regclass);


--
-- Name: offender_financials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_financials ALTER COLUMN id SET DEFAULT nextval('public.offender_financials_id_seq'::regclass);


--
-- Name: offender_identity_docs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_identity_docs ALTER COLUMN id SET DEFAULT nextval('public.offender_identity_docs_id_seq'::regclass);


--
-- Name: offenders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offenders ALTER COLUMN id SET DEFAULT nextval('public.offenders_id_seq'::regclass);


--
-- Name: palle_nidra_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.palle_nidra_checks ALTER COLUMN id SET DEFAULT nextval('public.palle_nidra_checks_id_seq'::regclass);


--
-- Name: petty_cases_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.petty_cases_checks ALTER COLUMN id SET DEFAULT nextval('public.petty_cases_checks_id_seq'::regclass);


--
-- Name: police_stations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.police_stations ALTER COLUMN id SET DEFAULT nextval('public.police_stations_id_seq'::regclass);


--
-- Name: railway_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.railway_checks ALTER COLUMN id SET DEFAULT nextval('public.railway_checks_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: rowdy_sheeter_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rowdy_sheeter_checks ALTER COLUMN id SET DEFAULT nextval('public.rowdy_sheeter_checks_id_seq'::regclass);


--
-- Name: seized_vehicles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seized_vehicles ALTER COLUMN id SET DEFAULT nextval('public.seized_vehicles_id_seq'::regclass);


--
-- Name: seizures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seizures ALTER COLUMN id SET DEFAULT nextval('public.seizures_id_seq'::regclass);


--
-- Name: social_media_intel id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_intel ALTER COLUMN id SET DEFAULT nextval('public.social_media_intel_id_seq'::regclass);


--
-- Name: supply_chain_links id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_chain_links ALTER COLUMN id SET DEFAULT nextval('public.supply_chain_links_id_seq'::regclass);


--
-- Name: surveillance_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveillance_records ALTER COLUMN id SET DEFAULT nextval('public.surveillance_records_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: tower_match_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tower_match_logs ALTER COLUMN id SET DEFAULT nextval('public.tower_match_logs_id_seq'::regclass);


--
-- Name: transaction_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_records ALTER COLUMN id SET DEFAULT nextval('public.transaction_records_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicle_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_checks ALTER COLUMN id SET DEFAULT nextval('public.vehicle_checks_id_seq'::regclass);


--
-- Name: village_visits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.village_visits ALTER COLUMN id SET DEFAULT nextval('public.village_visits_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, ip_address, user_agent, details, "timestamp") FROM stdin;
1	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:31:27.905
2	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:31:35.466
3	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:54:53.777
4	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 12:04:45.368
5	1	UPDATE	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	User sp updated: ["full_name","role","department","badge_number","police_station_id","password_hash"]	2026-06-03 12:05:54.336
6	1	EXPORT	OFFENDER	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Exported 19 offenders	2026-06-03 12:12:32.069
7	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-03 12:18:57.404
8	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 02:54:33.61
9	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 02:56:20.957
10	4	LOGIN	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 02:56:26.977
11	4	CREATE	ENFORCEMENT_CHECK	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Field check for venkatesh	2026-06-04 02:57:40.728
12	4	UPDATE	ENFORCEMENT_CHECK	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Test result: POSITIVE. ESCALATED_TO_SHO. Subject: venkatesh	2026-06-04 02:58:08.404
13	4	CREATE	OFFENDER	20	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Consumer created from enforcement check #1. Name: venkatesh	2026-06-04 03:38:16.724
14	4	UPDATE	ENFORCEMENT_CHECK	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	SHO approved. Consumer offender #20 created.	2026-06-04 03:38:17.194
15	4	LOGOUT	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 03:39:26.401
16	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 03:39:30.952
17	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 03:40:22.688
18	4	LOGIN	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 03:40:27.553
19	4	LOGOUT	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 03:40:43.885
20	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 03:40:47.686
21	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 03:45:37.558
22	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 03:45:41.32
23	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 08:57:18.28
24	4	LOGIN	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 08:57:30.627
25	4	LOGOUT	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 08:58:13.16
26	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 08:58:18.576
27	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 09:21:24.117
28	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 09:25:51.772
29	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 09:43:10.57
30	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 10:12:18.078
31	1	EXPORT	OFFENDER	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Exported 20 offenders	2026-06-04 10:13:33.422
32	1	EXPORT	OFFENDER	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Exported 20 offenders	2026-06-04 10:23:21.053
33	1	EXPORT	OFFENDER	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Exported 20 offenders	2026-06-04 10:23:24.198
34	1	EXPORT	OFFENDER	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Exported 20 offenders	2026-06-04 10:24:06.73
35	1	EXPORT	OFFENDER	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Exported 5 offenders	2026-06-04 10:25:02.574
36	1	EXPORT	OFFENDER	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Exported 5 offenders	2026-06-04 10:25:05.603
37	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 10:56:46.262
38	4	LOGIN	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 10:56:52.232
39	4	CREATE	ENFORCEMENT_CHECK	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Field check for Rasdlkfmwe	2026-06-04 10:57:42.748
40	4	UPDATE	ENFORCEMENT_CHECK	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Test result: POSITIVE. ESCALATED_TO_SHO. Subject: Rasdlkfmwe	2026-06-04 10:58:18.443
41	4	LOGOUT	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 11:22:43.101
42	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-04 11:23:31.108
43	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-05 12:42:56.522
44	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-05 12:58:24.936
45	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 03:12:42.726
46	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 03:30:40.622
47	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 03:59:07.639
48	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 04:24:21.592
49	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 05:46:10.526
50	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 06:02:08.07
51	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 06:08:46.205
52	4	LOGIN	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 06:08:51.633
53	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 06:09:45.794
54	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 06:09:49.685
55	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 07:14:27.908
56	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 07:15:30.572
57	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 07:37:56.222
58	1	VIEW	OFFENDER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	PII_REVEALED: aadhaar	2026-06-06 07:41:20.511
59	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 07:47:20.088
60	4	LOGIN	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 07:47:25.307
61	4	CREATE	ENFORCEMENT_CHECK	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Field check for Ramesh Babu (TP-EAST)	2026-06-06 07:51:50.938
62	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 07:51:58.515
63	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 07:52:05.581
64	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 07:55:17.786
65	4	LOGIN	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 07:55:25.159
66	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 07:55:55.9
67	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 02:56:30.72
68	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 02:58:43.767
69	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 03:17:01.612
70	4	LOGIN	USER	4	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 03:17:06.554
71	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 03:18:05.398
72	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 03:34:06.226
73	4	LOGIN	USER	4	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 03:43:41.452
74	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 03:44:14.844
75	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 04:06:40.607
76	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 04:06:42.973
77	4	LOGIN	USER	4	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 05:13:11.981
78	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 05:13:35.173
79	1	LOGIN	USER	1	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 05:13:40.869
80	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 05:14:32.6
81	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 05:16:33.206
82	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 05:27:41.985
83	4	LOGIN	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 05:27:45.783
84	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-09 05:33:02.441
85	4	LOGIN	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 05:33:09.133
86	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 05:45:56.138
87	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 05:45:59.422
88	4	LOGOUT	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 06:11:03.469
89	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 06:44:08.739
90	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 06:55:59.908
91	4	LOGIN	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 07:42:08.665
92	4	LOGOUT	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 07:57:25.927
93	1	CREATE	IMPORT	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	DPR import: 194 cases, 666 offenders	2026-06-09 07:57:29.914
94	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-09 08:21:40.556
95	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-10 06:00:02.323
96	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-10 07:51:54.247
97	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-10 14:00:19.316
98	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-10 14:19:17.413
99	1	LOGOUT	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-10 14:22:48.884
100	4	LOGIN	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-10 14:22:53.564
101	4	CREATE	LODGE_CHECK	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Lodge check logged for sfdgrn	2026-06-10 14:23:14.496
102	4	LOGOUT	USER	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-10 14:23:22.025
103	1	LOGIN	USER	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-10 14:23:27.227
104	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-12 12:23:31.066
105	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-12 12:37:39.336
106	4	LOGIN	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-12 13:08:30.336
107	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-12 13:12:54.308
108	1	LOGIN	USER	1	49.37.156.80	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-12 13:33:34.852
109	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-12 13:38:27.116
110	1	VIEW	OFFENDER	1198	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	PII_REVEALED: aadhaar	2026-06-12 13:38:34.967
111	1	VIEW	OFFENDER	1196	49.37.156.80	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	PII_REVEALED: aadhaar	2026-06-12 13:38:43.411
112	1	VIEW	OFFENDER	1196	49.37.156.80	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	PII_REVEALED: aadhaar	2026-06-12 13:38:50.056
113	1	LOGIN	USER	1	49.37.156.80	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	\N	2026-06-12 13:43:43.543
114	\N	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Login blocked: Concurrent session active	2026-06-12 13:49:43.052
115	1	LOGIN	USER	1	49.37.156.80	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	\N	2026-06-12 13:50:01.495
116	\N	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Login blocked: Concurrent session active	2026-06-12 13:50:21.583
117	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-12 13:51:17.794
118	1	LOGIN	USER	1	49.37.156.80	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	\N	2026-06-12 13:51:29.932
119	1	VIEW	OFFENDER	1196	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	PII_REVEALED: aadhaar	2026-06-12 13:53:51.069
120	1	VIEW	OFFENDER	1196	49.37.156.80	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	PII_REVEALED: aadhaar	2026-06-12 13:55:17.408
121	1	UPDATE	TEAM	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	User excise_sho removed from team	2026-06-12 13:55:56.127
122	1	DELETE	TEAM	3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Team deleted	2026-06-12 13:56:01.864
123	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-12 14:52:22.272
124	1	LOGIN	USER	1	49.37.156.80	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-12 15:01:48.594
125	1	LOGIN	USER	1	49.204.160.152	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-13 13:40:45.269
126	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-13 13:51:59.009
127	4	LOGIN	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-13 15:29:49.231
128	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-13 15:40:56.677
129	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-13 16:04:49.128
130	4	LOGIN	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-13 16:04:52.507
131	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-13 16:04:58.711
132	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-13 16:05:01.727
133	1	VIEW	REPORT	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Absconder report generated: 21 records	2026-06-14 08:07:02.869
134	1	VIEW	REPORT	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Absconder report generated: 21 records	2026-06-14 08:21:11.641
135	1	UPDATE	CASE_ACCUSED	494	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Arrest status changed: ABSCONDING → ARRESTED for Ramesh Babu (offender #1196) in case #494	2026-06-14 08:21:53.51
136	1	UPDATE	CASE	494	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Accused list updated	2026-06-14 08:21:53.925
137	1	VIEW	REPORT	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Absconder report generated: 20 records	2026-06-14 08:22:04.76
138	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-14 09:07:37.775
139	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-14 11:12:31.859
140	1	VIEW	REPORT	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Absconder report generated: 20 records	2026-06-14 11:13:05.185
141	1	VIEW	REPORT	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Absconder report generated: 20 records	2026-06-14 11:13:18.591
142	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-14 12:38:19.888
143	4	LOGIN	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-14 12:38:26.85
144	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-14 12:39:57.169
145	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-14 12:39:59.909
146	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-14 13:15:48.351
147	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-18 05:04:05.207
148	1	VIEW	REPORT	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Absconder report generated: 20 records	2026-06-18 05:04:38.475
149	1	CREATE	IMPORT	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	DPR import: 194 cases, 666 offenders	2026-06-18 05:36:02.752
150	1	VIEW	REPORT	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Absconder report generated: 20 records	2026-06-21 06:08:34.526
151	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-21 06:27:58.127
152	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-21 06:28:03.391
153	1	EXPORT	OFFENDER	1990	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	PDF history sheet exported for Ramesh Babu	2026-06-23 14:35:26.134
154	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-23 14:56:57.367
156	\N	LOGIN	USER	170	::ffff:127.0.0.1	\N	Login failed	2026-06-23 16:05:09.566
158	\N	LOGIN	USER	170	::ffff:127.0.0.1	\N	Login failed	2026-06-23 16:05:59.062
159	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-23 16:07:22.903
160	1	CREATE	SURVEILLANCE_RECORD	1	::ffff:127.0.0.1	\N	Created surveillance record for offender #2017	2026-06-23 16:22:48.339
161	2	CREATE	INFORMER	1	::ffff:127.0.0.1	\N	Registered informer with code name INF-TEST-99	2026-06-23 16:22:48.334
163	\N	LOGIN	USER	171	::ffff:127.0.0.1	\N	Login failed	2026-06-23 16:22:49.039
164	2	UPDATE	INFORMER	1	::ffff:127.0.0.1	\N	Updated informer INF-TEST-99	2026-06-23 16:22:49.556
165	2	UPDATE	SYSTEM_SETTINGS	\N	::ffff:127.0.0.1	\N	Updated system configurations: CHARGE_SHEET_DUE_DAYS_COMMERCIAL, CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL, ABSCONDER_ALERT_THRESHOLD_DAYS, COURT_HEARING_REMINDER_DAYS	2026-06-23 16:22:50.459
166	2	CREATE	INFORMER	2	::ffff:127.0.0.1	\N	Registered informer with code name INF-TEST-99	2026-06-23 16:23:17.027
167	1	CREATE	SURVEILLANCE_RECORD	2	::ffff:127.0.0.1	\N	Created surveillance record for offender #2100	2026-06-23 16:23:17.044
169	2	UPDATE	INFORMER	2	::ffff:127.0.0.1	\N	Updated informer INF-TEST-99	2026-06-23 16:23:18.325
171	\N	LOGIN	USER	172	::ffff:127.0.0.1	\N	Login failed	2026-06-23 16:23:20.868
172	2	UPDATE	SYSTEM_SETTINGS	\N	::ffff:127.0.0.1	\N	Updated system configurations: CHARGE_SHEET_DUE_DAYS_COMMERCIAL, CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL, ABSCONDER_ALERT_THRESHOLD_DAYS, COURT_HEARING_REMINDER_DAYS	2026-06-23 16:23:21.186
173	2	CREATE	INFORMER	3	::ffff:127.0.0.1	\N	Registered informer with code name INF-TEST-99	2026-06-23 16:27:07.532
174	1	CREATE	SURVEILLANCE_RECORD	3	::ffff:127.0.0.1	\N	Created surveillance record for offender #2100	2026-06-23 16:27:07.569
176	\N	LOGIN	USER	173	::ffff:127.0.0.1	\N	Login failed	2026-06-23 16:27:08.685
177	2	UPDATE	INFORMER	3	::ffff:127.0.0.1	\N	Updated informer INF-TEST-99	2026-06-23 16:27:08.79
178	2	UPDATE	SYSTEM_SETTINGS	\N	::ffff:127.0.0.1	\N	Updated system configurations: CHARGE_SHEET_DUE_DAYS_COMMERCIAL, CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL, ABSCONDER_ALERT_THRESHOLD_DAYS, COURT_HEARING_REMINDER_DAYS	2026-06-23 16:27:09.666
179	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-23 16:43:27.407
180	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 08:32:46.715
181	1	LOGIN	USER	1	49.37.157.211	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 08:49:58.755
182	1	VIEW	REPORT	\N	49.37.157.211	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Absconder report generated: 21 records	2026-06-25 08:57:01.639
183	1	VIEW	REPORT	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Absconder report generated: 21 records	2026-06-25 09:57:59.984
184	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 10:29:39.543
185	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 10:30:44.692
186	1	LOGOUT	USER	1	49.37.157.211	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 11:14:40.498
187	1	LOGIN	USER	1	49.37.157.211	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 11:14:48.181
188	1	EXPORT	OFFENDER	1990	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	PDF history sheet exported for Ramesh Babu	2026-06-25 11:33:12.324
189	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 11:37:10.954
190	4	LOGIN	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 11:37:20.056
191	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 11:46:30.459
192	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 11:46:54.776
193	2	CREATE	INFORMER	4	::ffff:127.0.0.1	\N	Registered informer with code name INF-TEST-99	2026-06-25 12:10:17.693
194	1	CREATE	SURVEILLANCE_RECORD	4	::ffff:127.0.0.1	\N	Created surveillance record for offender #2100	2026-06-25 12:10:17.733
196	\N	LOGIN	USER	183	::ffff:127.0.0.1	\N	Login failed	2026-06-25 12:10:18.775
197	2	UPDATE	INFORMER	4	::ffff:127.0.0.1	\N	Updated informer INF-TEST-99	2026-06-25 12:10:18.93
198	2	UPDATE	SYSTEM_SETTINGS	\N	::ffff:127.0.0.1	\N	Updated system configurations: CHARGE_SHEET_DUE_DAYS_COMMERCIAL, CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL, ABSCONDER_ALERT_THRESHOLD_DAYS, COURT_HEARING_REMINDER_DAYS	2026-06-25 12:10:20.003
199	2	CREATE	INFORMER	5	::ffff:127.0.0.1	\N	Registered informer with code name INF-TEST-99	2026-06-25 12:20:50.48
200	1	CREATE	SURVEILLANCE_RECORD	5	::ffff:127.0.0.1	\N	Created surveillance record for offender #2100	2026-06-25 12:20:50.557
202	\N	LOGIN	USER	184	::ffff:127.0.0.1	\N	Login failed	2026-06-25 12:20:51.236
203	2	UPDATE	INFORMER	5	::ffff:127.0.0.1	\N	Updated informer INF-TEST-99	2026-06-25 12:20:51.775
204	2	UPDATE	SYSTEM_SETTINGS	\N	::ffff:127.0.0.1	\N	Updated system configurations: CHARGE_SHEET_DUE_DAYS_COMMERCIAL, CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL, ABSCONDER_ALERT_THRESHOLD_DAYS, COURT_HEARING_REMINDER_DAYS	2026-06-25 12:20:52.665
205	1	CREATE	SURVEILLANCE_RECORD	6	::ffff:127.0.0.1	\N	Created surveillance record for offender #2100	2026-06-25 12:23:46.831
206	2	CREATE	INFORMER	6	::ffff:127.0.0.1	\N	Registered informer with code name INF-TEST-99	2026-06-25 12:23:46.841
208	\N	LOGIN	USER	185	::ffff:127.0.0.1	\N	Login failed	2026-06-25 12:23:47.866
209	2	UPDATE	INFORMER	6	::ffff:127.0.0.1	\N	Updated informer INF-TEST-99	2026-06-25 12:23:48.192
298	2	LOGIN	USER	2	::1	node	\N	2026-07-01 12:03:20.561
210	2	UPDATE	SYSTEM_SETTINGS	\N	::ffff:127.0.0.1	\N	Updated system configurations: CHARGE_SHEET_DUE_DAYS_COMMERCIAL, CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL, ABSCONDER_ALERT_THRESHOLD_DAYS, COURT_HEARING_REMINDER_DAYS	2026-06-25 12:23:49.41
211	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 12:41:47.011
212	1	LOGOUT	USER	1	49.37.157.211	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 12:47:33.651
213	1	LOGIN	USER	1	49.37.157.211	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	\N	2026-06-25 12:47:43.513
214	\N	LOGIN	USER	1	157.50.80.127	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36	Login failed	2026-06-25 14:04:41.039
215	1	LOGIN	USER	1	49.204.160.73	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-25 14:18:29.631
216	1	LOGOUT	USER	1	49.204.160.73	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-25 14:31:41.727
217	4	LOGIN	USER	4	49.204.160.73	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-25 14:32:20.733
218	4	LOGOUT	USER	4	49.204.160.73	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-25 14:32:59.995
219	3	LOGIN	USER	3	49.204.160.73	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-25 14:33:14.568
220	1	LOGIN	USER	1	49.37.157.211	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 15:17:37.444
221	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 15:17:38.399
223	\N	LOGIN	USER	186	::ffff:127.0.0.1	\N	Login failed	2026-06-25 15:19:54.323
224	2	CREATE	INFORMER	7	::ffff:127.0.0.1	\N	Registered informer with code name INF-TEST-99	2026-06-25 15:19:55.267
225	1	CREATE	SURVEILLANCE_RECORD	7	::ffff:127.0.0.1	\N	Created surveillance record for offender #2100	2026-06-25 15:19:55.925
226	2	UPDATE	INFORMER	7	::ffff:127.0.0.1	\N	Updated informer INF-TEST-99	2026-06-25 15:19:58.893
227	2	UPDATE	SYSTEM_SETTINGS	\N	::ffff:127.0.0.1	\N	Updated system configurations: CHARGE_SHEET_DUE_DAYS_COMMERCIAL, CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL, ABSCONDER_ALERT_THRESHOLD_DAYS, COURT_HEARING_REMINDER_DAYS	2026-06-25 15:20:09.795
228	3	LOGOUT	USER	3	49.204.160.73	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-25 15:24:44.76
229	3	LOGIN	USER	3	49.204.160.73	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-25 15:30:12.722
230	1	LOGOUT	USER	1	49.37.157.211	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-25 15:32:40.665
231	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-25 15:47:52.96
232	1	LOGIN	USER	1	49.37.157.211	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	\N	2026-06-26 04:46:51.742
233	1	LOGIN	USER	1	49.37.157.211	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-26 04:53:05.393
234	1	CREATE	SURVEILLANCE_RECORD	8	::ffff:127.0.0.1	\N	Created surveillance record for offender #2100	2026-06-26 05:08:27.514
236	2	CREATE	INFORMER	8	::ffff:127.0.0.1	\N	Registered informer with code name INF-TEST-99	2026-06-26 05:08:28.299
237	\N	LOGIN	USER	187	::ffff:127.0.0.1	\N	Login failed	2026-06-26 05:08:28.639
238	2	UPDATE	SYSTEM_SETTINGS	\N	::ffff:127.0.0.1	\N	Updated system configurations: CHARGE_SHEET_DUE_DAYS_COMMERCIAL, CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL, ABSCONDER_ALERT_THRESHOLD_DAYS, COURT_HEARING_REMINDER_DAYS	2026-06-26 05:08:30.072
239	2	UPDATE	INFORMER	8	::ffff:127.0.0.1	\N	Updated informer INF-TEST-99	2026-06-26 05:08:30.929
240	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-26 05:09:34.225
241	2	CREATE	INFORMER	9	::ffff:127.0.0.1	\N	Registered informer with code name INF-TEST-99	2026-06-26 05:14:45.951
242	1	CREATE	SURVEILLANCE_RECORD	9	::ffff:127.0.0.1	\N	Created surveillance record for offender #2100	2026-06-26 05:14:46.01
244	\N	LOGIN	USER	188	::ffff:127.0.0.1	\N	Login failed	2026-06-26 05:14:47.159
245	2	UPDATE	INFORMER	9	::ffff:127.0.0.1	\N	Updated informer INF-TEST-99	2026-06-26 05:14:47.346
246	2	UPDATE	SYSTEM_SETTINGS	\N	::ffff:127.0.0.1	\N	Updated system configurations: CHARGE_SHEET_DUE_DAYS_COMMERCIAL, CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL, ABSCONDER_ALERT_THRESHOLD_DAYS, COURT_HEARING_REMINDER_DAYS	2026-06-26 05:14:49.573
247	1	LOGOUT	USER	1	49.37.157.211	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-26 05:24:33.28
248	1	VIEW	REPORT	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	Absconder report generated: 21 records	2026-06-26 05:35:58.785
249	1	LOGIN	USER	1	49.37.157.211	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-26 05:40:10.339
250	1	LOGIN	USER	1	152.58.123.251	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-26 09:42:56.792
251	1	LOGIN	USER	1	152.58.176.208	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-26 09:43:11.645
252	1	VIEW	REPORT	\N	152.58.123.251	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	Absconder report generated: 21 records	2026-06-26 09:46:09.043
253	1	LOGOUT	USER	1	49.37.157.211	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-26 10:08:20.564
254	1	LOGOUT	USER	1	152.58.176.208	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-26 10:22:36.811
255	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 05:13:54.469
256	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 05:16:16.9
257	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 05:32:34.546
258	7	LOGOUT	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 05:54:15.854
259	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 07:00:46.865
260	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 07:01:01.536
261	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 07:01:04.675
262	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.8737	\N	2026-06-29 08:26:41.697
263	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.8737	\N	2026-06-29 08:26:45.987
264	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 08:31:23.102
265	7	LOGOUT	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 08:44:46.237
266	4	LOGIN	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 08:44:52.33
267	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 08:45:09.147
268	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 08:45:12.518
269	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 08:48:11.992
270	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 08:48:14.812
271	7	LOGOUT	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 09:50:40.402
272	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 12:44:57.222
273	7	LOGOUT	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 13:34:49.456
274	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 13:34:52.318
275	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 13:39:10.88
276	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 13:39:13.748
277	3	LOGIN	USER	3	128.77.30.251	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-29 16:16:32.865
278	7	LOGOUT	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-30 11:39:24.847
279	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-06-30 11:41:41.504
280	7	LOGIN	USER	7	49.37.157.94	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-01 08:27:57.834
281	7	LOGOUT	USER	7	49.37.157.94	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-01 09:10:01.783
282	7	LOGIN	USER	7	49.37.157.94	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-01 10:45:47.905
283	2	UPDATE	SYSTEM_SETTINGS	\N	::ffff:127.0.0.1	\N	Updated system configurations: CHARGE_SHEET_DUE_DAYS_COMMERCIAL, CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL, ABSCONDER_ALERT_THRESHOLD_DAYS, COURT_HEARING_REMINDER_DAYS	2026-07-01 11:01:38.917
284	2	CREATE	INFORMER	10	::ffff:127.0.0.1	\N	Registered informer with code name INF-TEST-99	2026-07-01 11:01:42.803
285	2	UPDATE	INFORMER	10	::ffff:127.0.0.1	\N	Updated informer INF-TEST-99	2026-07-01 11:01:44.05
287	\N	LOGIN	USER	198	::ffff:127.0.0.1	\N	Login failed	2026-07-01 11:01:50.604
288	7	LOGOUT	USER	7	49.37.157.94	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-01 11:13:12.217
290	\N	LOGIN	USER	199	::ffff:127.0.0.1	\N	Login failed	2026-07-01 11:28:34.789
291	2	LOGIN	USER	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-01 12:01:10.274
292	2	LOGOUT	USER	2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-01 12:01:16.303
293	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-01 12:01:18.463
294	1	LOGIN	USER	1	::1	node	\N	2026-07-01 12:02:12.076
295	1	LOGIN	USER	1	::1	node	\N	2026-07-01 12:02:41.71
296	1	LOGIN	USER	1	::1	node	\N	2026-07-01 12:02:52.525
297	1	LOGIN	USER	1	::1	node	\N	2026-07-01 12:03:20.192
299	3	LOGIN	USER	3	::1	node	\N	2026-07-01 12:03:20.923
300	4	LOGIN	USER	4	::1	node	\N	2026-07-01 12:03:21.281
301	6	LOGIN	USER	6	::1	node	\N	2026-07-01 12:03:21.644
302	8	LOGIN	USER	8	::1	node	\N	2026-07-01 12:03:22.011
303	1	LOGIN	USER	1	::1	node	\N	2026-07-01 12:04:14.482
304	2	LOGIN	USER	2	::1	node	\N	2026-07-01 12:04:14.9
305	3	LOGIN	USER	3	::1	node	\N	2026-07-01 12:04:15.247
306	4	LOGIN	USER	4	::1	node	\N	2026-07-01 12:04:15.586
307	6	LOGIN	USER	6	::1	node	\N	2026-07-01 12:04:15.924
308	8	LOGIN	USER	8	::1	node	\N	2026-07-01 12:04:16.261
309	7	LOGOUT	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-01 12:23:11.42
310	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-01 12:46:27.178
311	7	LOGIN	USER	7	49.37.158.218	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	\N	2026-07-06 06:09:55.902
312	7	LOGOUT	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-07 07:38:52.678
313	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-07 07:38:55.005
314	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-07 07:41:45.75
315	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-07 07:41:48.238
316	7	LOGOUT	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-07 07:55:14.507
317	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-07 07:55:16.488
318	1	LOGIN	USER	1	49.37.158.218	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36	\N	2026-07-07 08:04:03.205
319	4	LOGIN	USER	4	103.110.170.41	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	\N	2026-07-07 08:10:25.349
320	4	LOGOUT	USER	4	103.110.170.32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	\N	2026-07-07 08:28:46.305
321	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-07 09:04:20.894
322	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-07 11:08:11.954
323	1	LOGOUT	USER	1	49.37.158.218	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36	\N	2026-07-07 14:54:01.239
324	1	LOGIN	USER	1	115.245.41.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 05:31:20.851
325	1	LOGOUT	USER	1	115.245.41.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 06:01:11.325
326	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 06:31:05.517
327	7	LOGOUT	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 06:31:13.825
328	4	LOGIN	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 06:33:43.788
329	4	LOGOUT	USER	4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 06:37:56.742
330	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 06:37:59.608
331	1	VIEW	REPORT	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	Absconder report generated: 20 records	2026-07-08 06:39:31.057
332	1	VIEW	REPORT	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	Absconder report generated: 20 records	2026-07-08 06:39:36.685
333	1	LOGOUT	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 06:42:21.342
334	6	LOGIN	USER	6	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 06:42:25.032
335	6	LOGOUT	USER	6	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 06:52:02.973
336	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 06:52:06.454
337	1	LOGIN	USER	1	49.37.156.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 08:14:23.855
338	1	LOGOUT	USER	1	49.37.156.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 08:14:41.598
339	7	LOGIN	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 08:57:39.331
340	7	LOGOUT	USER	7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 09:15:11.834
341	1	LOGIN	USER	1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	\N	2026-07-08 09:29:55.033
\.


--
-- Data for Name: bail_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bail_records (id, case_id, case_accused_id, application_date, status, granted_date, court_name, surety_details, conditions, cancelled_at, notes, created_at) FROM stdin;
\.


--
-- Data for Name: bound_over_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bound_over_checks (id, ps_id, officer_id, subject_name, bound_over_date, expiry_date, court_order_no, compliance_status, violation_details, no_suspicious_activity, findings_notes, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
2	1	4	Siva	\N	\N	Cr 45/2023	\N	\N	f	\N	13.6260336	79.4385283	\N	2026-06-14 12:46:17.382
3	1	5	Siva	\N	\N	Cr 45/2023	\N	\N	f	\N	13.5959404	79.4481001	\N	2026-06-14 12:46:19.197
4	1	7	Siva	\N	\N	Cr 45/2023	\N	\N	f	\N	13.6105880	79.3962514	\N	2026-06-14 12:46:19.809
5	8	8	Siva	\N	\N	Cr 45/2023	\N	\N	f	\N	13.6108616	79.4064422	\N	2026-06-14 12:46:20.416
6	42	33	Siva	\N	\N	Cr 45/2023	\N	\N	f	\N	13.6225994	79.4187152	\N	2026-06-14 12:46:21.034
\.


--
-- Data for Name: bus_stand_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bus_stand_checks (id, ps_id, officer_id, bus_stand_name, buses_checked, passengers_checked, parcels_verified, no_suspicious_activity, findings_notes, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
1	1	4	Central Bus Stand	\N	28	f	f	\N	13.5940872	79.4420115	\N	2026-06-14 12:46:17.997
2	1	5	Central Bus Stand	\N	28	f	f	\N	13.6532907	79.4404572	\N	2026-06-14 12:46:19.339
3	1	7	Central Bus Stand	\N	28	f	f	\N	13.5928379	79.3788661	\N	2026-06-14 12:46:19.954
4	8	8	Central Bus Stand	\N	28	f	f	\N	13.6738060	79.3798268	\N	2026-06-14 12:46:20.555
5	42	33	Central Bus Stand	\N	28	f	f	\N	13.5868361	79.4364981	\N	2026-06-14 12:46:21.176
\.


--
-- Data for Name: case_accused; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.case_accused (id, case_id, offender_id, previous_cr_no, previous_ps_id, arrest_status, arrest_date, bail_date, bail_conditions, created_at) FROM stdin;
2811	1600	2771	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:06:53.994
2812	1601	2772	\N	\N	ARRESTED	2026-01-11	\N	\N	2026-07-07 13:06:54.989
2813	1602	2773	\N	\N	ARRESTED	2026-02-10	\N	\N	2026-07-07 13:06:55.899
2814	1603	2774	\N	\N	ARRESTED	2026-02-11	\N	\N	2026-07-07 13:06:56.759
2815	1604	2775	\N	\N	ARRESTED	2026-03-10	\N	\N	2026-07-07 13:06:57.642
2816	1605	2776	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:06:58.518
2817	1606	2777	\N	\N	BAILED	2026-04-10	2026-04-20	\N	2026-07-07 13:06:59.435
2818	1607	2778	\N	\N	ARRESTED	2026-04-11	\N	\N	2026-07-07 13:07:00.264
2819	1608	2779	\N	\N	ARRESTED	2026-05-10	\N	\N	2026-07-07 13:07:01.068
2820	1609	2780	\N	\N	BAILED	2026-05-11	2026-05-21	\N	2026-07-07 13:07:01.951
2821	1610	2781	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:07:02.863
2822	1611	2782	\N	\N	ARRESTED	2026-01-11	\N	\N	2026-07-07 13:07:03.749
2823	1612	2783	\N	\N	BAILED	2026-02-10	2026-02-20	\N	2026-07-07 13:07:04.618
2824	1613	2784	\N	\N	ARRESTED	2026-02-11	\N	\N	2026-07-07 13:07:05.506
2825	1614	2785	\N	\N	ARRESTED	2026-03-10	\N	\N	2026-07-07 13:07:06.387
2826	1615	2786	\N	\N	ARRESTED	2026-03-11	\N	\N	2026-07-07 13:07:07.201
2827	1616	2787	\N	\N	ARRESTED	2026-04-10	\N	\N	2026-07-07 13:07:07.999
2828	1617	2788	\N	\N	ARRESTED	2026-04-11	\N	\N	2026-07-07 13:07:08.875
2829	1618	2789	\N	\N	BAILED	2026-05-10	2026-05-20	\N	2026-07-07 13:07:09.761
2830	1619	2790	\N	\N	ARRESTED	2026-05-11	\N	\N	2026-07-07 13:07:10.706
2831	1620	2791	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:07:11.509
2832	1621	2792	\N	\N	BAILED	2026-01-11	2026-01-21	\N	2026-07-07 13:07:12.325
2833	1622	2793	\N	\N	ARRESTED	2026-02-10	\N	\N	2026-07-07 13:07:13.198
2834	1623	2794	\N	\N	ARRESTED	2026-02-11	\N	\N	2026-07-07 13:07:14.074
2835	1624	2795	\N	\N	BAILED	2026-03-10	2026-03-20	\N	2026-07-07 13:07:14.953
2836	1625	2796	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:07:15.832
2837	1626	2797	\N	\N	ARRESTED	2026-04-10	\N	\N	2026-07-07 13:07:16.653
2838	1627	2798	\N	\N	ARRESTED	2026-04-11	\N	\N	2026-07-07 13:07:17.474
2839	1628	2799	\N	\N	ARRESTED	2026-05-10	\N	\N	2026-07-07 13:07:18.279
2840	1629	2800	\N	\N	ARRESTED	2026-05-11	\N	\N	2026-07-07 13:07:19.174
2841	1630	2801	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:07:20.004
2842	1631	2802	\N	\N	ARRESTED	2026-01-11	\N	\N	2026-07-07 13:07:20.814
2843	1632	2803	\N	\N	ARRESTED	2026-02-10	\N	\N	2026-07-07 13:07:21.628
2844	1633	2804	\N	\N	BAILED	2026-02-11	2026-02-21	\N	2026-07-07 13:07:22.511
2845	1634	2805	\N	\N	ARRESTED	2026-03-10	\N	\N	2026-07-07 13:07:23.402
2846	1635	2806	\N	\N	ARRESTED	2026-03-11	\N	\N	2026-07-07 13:07:24.276
2847	1636	2807	\N	\N	BAILED	2026-04-10	2026-04-20	\N	2026-07-07 13:07:25.171
2848	1637	2808	\N	\N	ARRESTED	2026-04-11	\N	\N	2026-07-07 13:07:26.111
2849	1638	2809	\N	\N	ARRESTED	2026-05-10	\N	\N	2026-07-07 13:07:26.99
2850	1639	2810	\N	\N	ARRESTED	2026-05-11	\N	\N	2026-07-07 13:07:27.795
2851	1640	2811	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:07:28.684
2852	1641	2812	\N	\N	ARRESTED	2026-01-11	\N	\N	2026-07-07 13:07:29.568
2853	1642	2813	\N	\N	BAILED	2026-02-10	2026-02-20	\N	2026-07-07 13:07:30.381
2854	1643	2814	\N	\N	ARRESTED	2026-02-11	\N	\N	2026-07-07 13:07:31.249
2855	1644	2815	\N	\N	ARRESTED	2026-03-10	\N	\N	2026-07-07 13:07:32.071
2856	1645	2816	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:07:32.967
2857	1646	2817	\N	\N	ARRESTED	2026-04-10	\N	\N	2026-07-07 13:07:33.784
2858	1647	2818	\N	\N	ARRESTED	2026-04-11	\N	\N	2026-07-07 13:07:34.601
2859	1648	2819	\N	\N	BAILED	2026-05-10	2026-05-20	\N	2026-07-07 13:07:35.485
2860	1649	2820	\N	\N	ARRESTED	2026-05-11	\N	\N	2026-07-07 13:07:36.359
2861	1650	2821	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:07:37.233
2862	1651	2822	\N	\N	ARRESTED	2026-01-11	\N	\N	2026-07-07 13:07:38.039
2863	1652	2823	\N	\N	ARRESTED	2026-02-10	\N	\N	2026-07-07 13:07:38.846
2864	1653	2824	\N	\N	ARRESTED	2026-02-11	\N	\N	2026-07-07 13:07:39.737
2865	1654	2825	\N	\N	BAILED	2026-03-10	2026-03-20	\N	2026-07-07 13:07:40.531
2866	1655	2826	\N	\N	ARRESTED	2026-03-11	\N	\N	2026-07-07 13:07:41.46
2867	1656	2827	\N	\N	ARRESTED	2026-04-10	\N	\N	2026-07-07 13:07:42.277
2868	1657	2828	\N	\N	BAILED	2026-04-11	2026-04-21	\N	2026-07-07 13:07:43.135
2869	1658	2829	\N	\N	ARRESTED	2026-05-10	\N	\N	2026-07-07 13:07:44.008
2870	1659	2830	\N	\N	ARRESTED	2026-05-11	\N	\N	2026-07-07 13:07:44.742
2871	1660	2831	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:07:45.558
2872	1661	2832	\N	\N	ARRESTED	2026-01-11	\N	\N	2026-07-07 13:07:46.356
2873	1662	2833	\N	\N	ARRESTED	2026-02-10	\N	\N	2026-07-07 13:07:47.232
2874	1663	2834	\N	\N	ARRESTED	2026-02-11	\N	\N	2026-07-07 13:07:48.088
2875	1664	2835	\N	\N	ARRESTED	2026-03-10	\N	\N	2026-07-07 13:07:48.953
2876	1665	2836	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:07:49.815
2877	1666	2837	\N	\N	BAILED	2026-04-10	2026-04-20	\N	2026-07-07 13:07:50.628
2878	1667	2838	\N	\N	ARRESTED	2026-04-11	\N	\N	2026-07-07 13:07:51.497
2879	1668	2839	\N	\N	ARRESTED	2026-05-10	\N	\N	2026-07-07 13:07:52.302
2880	1669	2840	\N	\N	BAILED	2026-05-11	2026-05-21	\N	2026-07-07 13:07:53.165
2881	1670	2841	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:07:53.901
2882	1671	2842	\N	\N	ARRESTED	2026-01-11	\N	\N	2026-07-07 13:07:54.767
2883	1672	2843	\N	\N	BAILED	2026-02-10	2026-02-20	\N	2026-07-07 13:07:55.621
2884	1673	2844	\N	\N	ARRESTED	2026-02-11	\N	\N	2026-07-07 13:07:56.483
2885	1674	2845	\N	\N	ARRESTED	2026-03-10	\N	\N	2026-07-07 13:07:57.342
2886	1675	2846	\N	\N	ARRESTED	2026-03-11	\N	\N	2026-07-07 13:07:58.212
2887	1676	2847	\N	\N	ARRESTED	2026-04-10	\N	\N	2026-07-07 13:07:59.012
2888	1677	2848	\N	\N	ARRESTED	2026-04-11	\N	\N	2026-07-07 13:07:59.894
2889	1678	2849	\N	\N	BAILED	2026-05-10	2026-05-20	\N	2026-07-07 13:08:00.785
2890	1679	2850	\N	\N	ARRESTED	2026-05-11	\N	\N	2026-07-07 13:08:01.598
2891	1680	2851	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:08:02.419
2892	1681	2852	\N	\N	BAILED	2026-01-11	2026-01-21	\N	2026-07-07 13:08:03.25
2893	1682	2853	\N	\N	ARRESTED	2026-02-10	\N	\N	2026-07-07 13:08:04.124
2894	1683	2854	\N	\N	ARRESTED	2026-02-11	\N	\N	2026-07-07 13:08:04.991
2895	1684	2855	\N	\N	BAILED	2026-03-10	2026-03-20	\N	2026-07-07 13:08:05.872
2896	1685	2856	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:08:06.747
2897	1686	2857	\N	\N	ARRESTED	2026-04-10	\N	\N	2026-07-07 13:08:07.623
2898	1687	2858	\N	\N	ARRESTED	2026-04-11	\N	\N	2026-07-07 13:08:08.496
2899	1688	2859	\N	\N	ARRESTED	2026-05-10	\N	\N	2026-07-07 13:08:09.315
2900	1689	2860	\N	\N	ARRESTED	2026-05-11	\N	\N	2026-07-07 13:08:10.429
2901	1690	2861	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:08:11.362
2902	1691	2862	\N	\N	ARRESTED	2026-01-11	\N	\N	2026-07-07 13:08:12.297
2903	1692	2863	\N	\N	ARRESTED	2026-02-10	\N	\N	2026-07-07 13:08:13.169
2904	1693	2864	\N	\N	BAILED	2026-02-11	2026-02-21	\N	2026-07-07 13:08:14.01
2905	1694	2865	\N	\N	ARRESTED	2026-03-10	\N	\N	2026-07-07 13:08:14.899
2906	1695	2866	\N	\N	ARRESTED	2026-03-11	\N	\N	2026-07-07 13:08:15.7
2907	1696	2867	\N	\N	BAILED	2026-04-10	2026-04-20	\N	2026-07-07 13:08:16.511
2908	1697	2868	\N	\N	ARRESTED	2026-04-11	\N	\N	2026-07-07 13:08:17.329
2909	1698	2869	\N	\N	ARRESTED	2026-05-10	\N	\N	2026-07-07 13:08:18.211
2910	1699	2870	\N	\N	ARRESTED	2026-05-11	\N	\N	2026-07-07 13:08:19.026
2911	1700	2871	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:08:19.966
2912	1701	2872	\N	\N	ARRESTED	2026-01-11	\N	\N	2026-07-07 13:08:20.85
2913	1702	2873	\N	\N	BAILED	2026-02-10	2026-02-20	\N	2026-07-07 13:08:21.663
2914	1703	2874	\N	\N	ARRESTED	2026-02-11	\N	\N	2026-07-07 13:08:22.538
2915	1704	2875	\N	\N	ARRESTED	2026-03-10	\N	\N	2026-07-07 13:08:23.422
2916	1705	2876	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:08:24.22
2917	1706	2877	\N	\N	ARRESTED	2026-04-10	\N	\N	2026-07-07 13:08:25.078
2918	1707	2878	\N	\N	ARRESTED	2026-04-11	\N	\N	2026-07-07 13:08:25.97
2919	1708	2879	\N	\N	BAILED	2026-05-10	2026-05-20	\N	2026-07-07 13:08:26.824
2920	1709	2880	\N	\N	ARRESTED	2026-05-11	\N	\N	2026-07-07 13:08:27.637
2921	1710	2881	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:08:28.526
2922	1711	2882	\N	\N	ARRESTED	2026-01-11	\N	\N	2026-07-07 13:08:29.275
2923	1712	2883	\N	\N	ARRESTED	2026-02-10	\N	\N	2026-07-07 13:08:30.157
2924	1713	2884	\N	\N	ARRESTED	2026-02-11	\N	\N	2026-07-07 13:08:31.048
2925	1714	2885	\N	\N	BAILED	2026-03-10	2026-03-20	\N	2026-07-07 13:08:31.872
2926	1715	2886	\N	\N	ARRESTED	2026-03-11	\N	\N	2026-07-07 13:08:32.749
2927	1716	2887	\N	\N	ARRESTED	2026-04-10	\N	\N	2026-07-07 13:08:33.64
2928	1717	2888	\N	\N	BAILED	2026-04-11	2026-04-21	\N	2026-07-07 13:08:34.583
2929	1718	2889	\N	\N	ARRESTED	2026-05-10	\N	\N	2026-07-07 13:08:35.465
2930	1719	2890	\N	\N	ARRESTED	2026-05-11	\N	\N	2026-07-07 13:08:36.345
2931	1720	2891	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:08:37.181
2932	1721	2892	\N	\N	ARRESTED	2026-01-11	\N	\N	2026-07-07 13:08:38.054
2933	1722	2893	\N	\N	ARRESTED	2026-02-10	\N	\N	2026-07-07 13:08:38.938
2934	1723	2894	\N	\N	ARRESTED	2026-02-11	\N	\N	2026-07-07 13:08:39.832
2935	1724	2895	\N	\N	ARRESTED	2026-03-10	\N	\N	2026-07-07 13:08:40.633
2936	1725	2896	\N	\N	ABSCONDING	\N	\N	\N	2026-07-07 13:08:41.44
2937	1726	2897	\N	\N	BAILED	2026-04-10	2026-04-20	\N	2026-07-07 13:08:42.333
2938	1727	2898	\N	\N	ARRESTED	2026-04-11	\N	\N	2026-07-07 13:08:43.222
2939	1728	2776	\N	\N	ARRESTED	2026-06-16	\N	\N	2026-07-07 13:08:43.363
2940	1728	2772	\N	\N	ARRESTED	2026-06-17	\N	\N	2026-07-07 13:08:43.363
2941	1728	2773	\N	\N	BAILED	2026-06-18	\N	\N	2026-07-07 13:08:43.363
\.


--
-- Data for Name: cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cases (id, fir_no, ps_id, section_of_law, case_date, stage, nature_of_offence, contraband_type, quantity, quantity_unit, street_value, source_location, destination_location, intelligence_notes, department, created_by, created_at, is_history_sheet, is_rowdy_sheet, relevant_files, updated_at) FROM stdin;
1600	TPT-026/2026/100	45	Sec. 27 of NDPS Act	2026-01-10	FIR	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:06:53.723	f	f	\N	2026-07-07 13:06:53.723
1601	TPT-026/2026/101	45	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CHARGESHEET	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:06:54.787	f	f	\N	2026-07-07 13:06:54.787
1602	ALP/2026/102	6	Sec. 27 of NDPS Act	2026-02-10	TRIAL	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:06:55.738	f	f	\N	2026-07-07 13:06:55.738
1603	ALP/2026/103	6	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CONVICTED	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:06:56.622	f	f	\N	2026-07-07 13:06:56.622
1604	TP-EAST/2026/104	1	Sec. 27 of NDPS Act	2026-03-10	FIR	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:06:57.502	f	f	\N	2026-07-07 13:06:57.502
1605	TP-EAST/2026/105	1	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CHARGESHEET	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:06:58.379	f	f	\N	2026-07-07 13:06:58.379
1606	SRC/2026/106	7	Sec. 27 of NDPS Act	2026-04-10	TRIAL	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:06:59.294	f	f	\N	2026-07-07 13:06:59.294
1607	SRC/2026/107	7	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CONVICTED	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:00.124	f	f	\N	2026-07-07 13:07:00.124
1608	TPT-048/2026/108	67	Sec. 27 of NDPS Act	2026-05-10	FIR	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:00.932	f	f	\N	2026-07-07 13:07:00.932
1609	TPT-048/2026/109	67	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CHARGESHEET	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:01.814	f	f	\N	2026-07-07 13:07:01.814
1610	TPT-049/2026/110	68	Sec. 27 of NDPS Act	2026-01-10	TRIAL	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:02.725	f	f	\N	2026-07-07 13:07:02.725
1611	TPT-049/2026/111	68	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CONVICTED	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:03.61	f	f	\N	2026-07-07 13:07:03.61
1612	TPT-052/2026/112	71	Sec. 27 of NDPS Act	2026-02-10	FIR	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:04.479	f	f	\N	2026-07-07 13:07:04.479
1613	TPT-052/2026/113	71	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CHARGESHEET	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:05.367	f	f	\N	2026-07-07 13:07:05.367
1614	EX-CGR/2026/114	13	Sec. 27 of NDPS Act	2026-03-10	TRIAL	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:06.248	f	f	\N	2026-07-07 13:07:06.248
1615	EX-CGR/2026/115	13	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CONVICTED	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:07.063	f	f	\N	2026-07-07 13:07:07.063
1616	EX-TML/2026/116	14	Sec. 27 of NDPS Act	2026-04-10	FIR	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:07.862	f	f	\N	2026-07-07 13:07:07.862
1617	EX-TML/2026/117	14	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CHARGESHEET	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:08.734	f	f	\N	2026-07-07 13:07:08.734
1618	EX-GDR/2026/118	15	Sec. 27 of NDPS Act	2026-05-10	TRIAL	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:09.618	f	f	\N	2026-07-07 13:07:09.618
1619	EX-GDR/2026/119	15	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CONVICTED	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:10.503	f	f	\N	2026-07-07 13:07:10.503
1620	EX-NDP/2026/120	16	Sec. 27 of NDPS Act	2026-01-10	FIR	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:11.369	f	f	\N	2026-07-07 13:07:11.369
1621	EX-NDP/2026/121	16	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CHARGESHEET	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:12.186	f	f	\N	2026-07-07 13:07:12.186
1622	EX-SLPT/2026/122	17	Sec. 27 of NDPS Act	2026-02-10	TRIAL	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:13.061	f	f	\N	2026-07-07 13:07:13.061
1623	EX-SLPT/2026/123	17	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CONVICTED	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:13.933	f	f	\N	2026-07-07 13:07:13.933
1624	EX-VKD/2026/124	18	Sec. 27 of NDPS Act	2026-03-10	FIR	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:14.813	f	f	\N	2026-07-07 13:07:14.813
1625	EX-VKD/2026/125	18	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CHARGESHEET	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:15.69	f	f	\N	2026-07-07 13:07:15.69
1626	EX-VGR/2026/126	19	Sec. 27 of NDPS Act	2026-04-10	TRIAL	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:16.514	f	f	\N	2026-07-07 13:07:16.514
1627	EX-VGR/2026/127	19	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CONVICTED	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:07:17.324	f	f	\N	2026-07-07 13:07:17.324
1628	TPT-001/2026/128	20	Sec. 27 of NDPS Act	2026-05-10	FIR	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:18.142	f	f	\N	2026-07-07 13:07:18.142
1629	TPT-001/2026/129	20	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CHARGESHEET	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:19.022	f	f	\N	2026-07-07 13:07:19.022
1630	TPT-002/2026/130	21	Sec. 27 of NDPS Act	2026-01-10	TRIAL	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:19.864	f	f	\N	2026-07-07 13:07:19.864
1631	TPT-002/2026/131	21	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CONVICTED	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:20.674	f	f	\N	2026-07-07 13:07:20.674
1632	TPT-003/2026/132	22	Sec. 27 of NDPS Act	2026-02-10	FIR	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:21.49	f	f	\N	2026-07-07 13:07:21.49
1633	TPT-003/2026/133	22	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CHARGESHEET	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:22.372	f	f	\N	2026-07-07 13:07:22.372
1634	TPT-004/2026/134	23	Sec. 27 of NDPS Act	2026-03-10	TRIAL	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:23.264	f	f	\N	2026-07-07 13:07:23.264
1635	TPT-004/2026/135	23	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CONVICTED	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:24.135	f	f	\N	2026-07-07 13:07:24.135
1636	TPT-005/2026/136	24	Sec. 27 of NDPS Act	2026-04-10	FIR	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:25.033	f	f	\N	2026-07-07 13:07:25.033
1637	TPT-005/2026/137	24	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CHARGESHEET	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:25.907	f	f	\N	2026-07-07 13:07:25.907
1638	TPT-006/2026/138	25	Sec. 27 of NDPS Act	2026-05-10	TRIAL	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:26.85	f	f	\N	2026-07-07 13:07:26.85
1639	TPT-006/2026/139	25	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CONVICTED	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:27.655	f	f	\N	2026-07-07 13:07:27.655
1640	TPT-007/2026/140	26	Sec. 27 of NDPS Act	2026-01-10	FIR	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:28.54	f	f	\N	2026-07-07 13:07:28.54
1641	TPT-007/2026/141	26	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CHARGESHEET	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:29.428	f	f	\N	2026-07-07 13:07:29.428
1642	TPT-008/2026/142	27	Sec. 27 of NDPS Act	2026-02-10	TRIAL	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:30.24	f	f	\N	2026-07-07 13:07:30.24
1643	TPT-008/2026/143	27	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CONVICTED	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:31.11	f	f	\N	2026-07-07 13:07:31.11
1644	TPT-009/2026/144	28	Sec. 27 of NDPS Act	2026-03-10	FIR	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:31.93	f	f	\N	2026-07-07 13:07:31.93
1645	TPT-009/2026/145	28	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CHARGESHEET	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:32.828	f	f	\N	2026-07-07 13:07:32.828
1646	TPT-010/2026/146	29	Sec. 27 of NDPS Act	2026-04-10	TRIAL	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:33.643	f	f	\N	2026-07-07 13:07:33.643
1647	TPT-010/2026/147	29	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CONVICTED	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:34.462	f	f	\N	2026-07-07 13:07:34.462
1648	TPT-011/2026/148	30	Sec. 27 of NDPS Act	2026-05-10	FIR	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:35.345	f	f	\N	2026-07-07 13:07:35.345
1649	TPT-011/2026/149	30	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CHARGESHEET	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:36.22	f	f	\N	2026-07-07 13:07:36.22
1650	TPT-012/2026/150	31	Sec. 27 of NDPS Act	2026-01-10	TRIAL	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:37.088	f	f	\N	2026-07-07 13:07:37.088
1651	TPT-012/2026/151	31	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CONVICTED	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:37.899	f	f	\N	2026-07-07 13:07:37.899
1652	TPT-013/2026/152	32	Sec. 27 of NDPS Act	2026-02-10	FIR	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:38.711	f	f	\N	2026-07-07 13:07:38.711
1653	TPT-013/2026/153	32	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CHARGESHEET	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:39.597	f	f	\N	2026-07-07 13:07:39.597
1654	TPT-014/2026/154	33	Sec. 27 of NDPS Act	2026-03-10	TRIAL	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:40.397	f	f	\N	2026-07-07 13:07:40.397
1655	TPT-014/2026/155	33	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CONVICTED	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:41.262	f	f	\N	2026-07-07 13:07:41.262
1656	TPT-015/2026/156	34	Sec. 27 of NDPS Act	2026-04-10	FIR	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:42.138	f	f	\N	2026-07-07 13:07:42.138
1657	TPT-015/2026/157	34	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CHARGESHEET	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:43.002	f	f	\N	2026-07-07 13:07:43.002
1658	TPT-016/2026/158	35	Sec. 27 of NDPS Act	2026-05-10	TRIAL	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:43.87	f	f	\N	2026-07-07 13:07:43.87
1659	TPT-016/2026/159	35	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CONVICTED	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:44.61	f	f	\N	2026-07-07 13:07:44.61
1660	TPT-017/2026/160	36	Sec. 27 of NDPS Act	2026-01-10	FIR	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:45.415	f	f	\N	2026-07-07 13:07:45.415
1661	TPT-017/2026/161	36	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CHARGESHEET	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:46.22	f	f	\N	2026-07-07 13:07:46.22
1662	RGT/2026/162	4	Sec. 27 of NDPS Act	2026-02-10	TRIAL	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:47.097	f	f	\N	2026-07-07 13:07:47.097
1663	RGT/2026/163	4	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CONVICTED	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:47.953	f	f	\N	2026-07-07 13:07:47.953
1664	TPT-019/2026/164	38	Sec. 27 of NDPS Act	2026-03-10	FIR	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:48.818	f	f	\N	2026-07-07 13:07:48.818
1665	TPT-019/2026/165	38	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CHARGESHEET	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:49.681	f	f	\N	2026-07-07 13:07:49.681
1666	TPT-020/2026/166	39	Sec. 27 of NDPS Act	2026-04-10	TRIAL	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:50.489	f	f	\N	2026-07-07 13:07:50.489
1667	TPT-020/2026/167	39	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CONVICTED	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:51.36	f	f	\N	2026-07-07 13:07:51.36
1668	TPT-021/2026/168	40	Sec. 27 of NDPS Act	2026-05-10	FIR	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:52.159	f	f	\N	2026-07-07 13:07:52.159
1669	TPT-021/2026/169	40	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CHARGESHEET	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:53.028	f	f	\N	2026-07-07 13:07:53.028
1670	TPT-022/2026/170	41	Sec. 27 of NDPS Act	2026-01-10	TRIAL	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:53.767	f	f	\N	2026-07-07 13:07:53.767
1671	TPT-022/2026/171	41	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CONVICTED	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:54.627	f	f	\N	2026-07-07 13:07:54.627
1672	TPT-023/2026/172	42	Sec. 27 of NDPS Act	2026-02-10	FIR	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:55.487	f	f	\N	2026-07-07 13:07:55.487
1673	TPT-023/2026/173	42	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CHARGESHEET	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:56.282	f	f	\N	2026-07-07 13:07:56.282
1674	TPT-024/2026/174	43	Sec. 27 of NDPS Act	2026-03-10	TRIAL	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:57.207	f	f	\N	2026-07-07 13:07:57.207
1675	TPT-024/2026/175	43	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CONVICTED	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:58.065	f	f	\N	2026-07-07 13:07:58.065
1676	TPT-025/2026/176	44	Sec. 27 of NDPS Act	2026-04-10	FIR	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:58.871	f	f	\N	2026-07-07 13:07:58.871
1677	TPT-025/2026/177	44	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CHARGESHEET	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:07:59.758	f	f	\N	2026-07-07 13:07:59.758
1678	TPT-027/2026/178	46	Sec. 27 of NDPS Act	2026-05-10	TRIAL	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:00.643	f	f	\N	2026-07-07 13:08:00.643
1679	TPT-027/2026/179	46	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CONVICTED	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:01.461	f	f	\N	2026-07-07 13:08:01.461
1680	TPT-028/2026/180	47	Sec. 27 of NDPS Act	2026-01-10	FIR	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:02.282	f	f	\N	2026-07-07 13:08:02.282
1681	TPT-028/2026/181	47	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CHARGESHEET	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:03.113	f	f	\N	2026-07-07 13:08:03.113
1682	TPT-029/2026/182	48	Sec. 27 of NDPS Act	2026-02-10	TRIAL	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:03.986	f	f	\N	2026-07-07 13:08:03.986
1683	TPT-029/2026/183	48	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CONVICTED	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:04.849	f	f	\N	2026-07-07 13:08:04.849
1684	TPT-030/2026/184	49	Sec. 27 of NDPS Act	2026-03-10	FIR	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:05.73	f	f	\N	2026-07-07 13:08:05.73
1685	TPT-030/2026/185	49	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CHARGESHEET	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:06.612	f	f	\N	2026-07-07 13:08:06.612
1686	TPT-031/2026/186	50	Sec. 27 of NDPS Act	2026-04-10	TRIAL	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:07.482	f	f	\N	2026-07-07 13:08:07.482
1687	TPT-031/2026/187	50	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CONVICTED	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:08.358	f	f	\N	2026-07-07 13:08:08.358
1688	TPT-032/2026/188	51	Sec. 27 of NDPS Act	2026-05-10	FIR	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:09.17	f	f	\N	2026-07-07 13:08:09.17
1689	TPT-032/2026/189	51	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CHARGESHEET	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:10.294	f	f	\N	2026-07-07 13:08:10.294
1690	TPT-033/2026/190	52	Sec. 27 of NDPS Act	2026-01-10	TRIAL	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:11.222	f	f	\N	2026-07-07 13:08:11.222
1691	TPT-033/2026/191	52	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CONVICTED	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:12.158	f	f	\N	2026-07-07 13:08:12.158
1692	TCR/2026/192	3	Sec. 27 of NDPS Act	2026-02-10	FIR	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:13.031	f	f	\N	2026-07-07 13:08:13.031
1693	TCR/2026/193	3	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CHARGESHEET	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:13.869	f	f	\N	2026-07-07 13:08:13.869
1694	TPT-035/2026/194	54	Sec. 27 of NDPS Act	2026-03-10	TRIAL	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:14.754	f	f	\N	2026-07-07 13:08:14.754
1695	TPT-035/2026/195	54	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CONVICTED	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:15.561	f	f	\N	2026-07-07 13:08:15.561
1696	CGR-PS/2026/196	5	Sec. 27 of NDPS Act	2026-04-10	FIR	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:16.37	f	f	\N	2026-07-07 13:08:16.37
1697	CGR-PS/2026/197	5	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CHARGESHEET	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:17.191	f	f	\N	2026-07-07 13:08:17.191
1698	TPT-037/2026/198	56	Sec. 27 of NDPS Act	2026-05-10	TRIAL	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:18.069	f	f	\N	2026-07-07 13:08:18.069
1699	TPT-037/2026/199	56	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CONVICTED	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:18.88	f	f	\N	2026-07-07 13:08:18.88
1700	TPT-038/2026/200	57	Sec. 27 of NDPS Act	2026-01-10	FIR	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:19.762	f	f	\N	2026-07-07 13:08:19.762
1701	TPT-038/2026/201	57	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CHARGESHEET	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:20.713	f	f	\N	2026-07-07 13:08:20.713
1702	TPT-039/2026/202	58	Sec. 27 of NDPS Act	2026-02-10	TRIAL	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:21.522	f	f	\N	2026-07-07 13:08:21.522
1703	TPT-039/2026/203	58	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CONVICTED	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:22.399	f	f	\N	2026-07-07 13:08:22.399
1704	TPT-040/2026/204	59	Sec. 27 of NDPS Act	2026-03-10	FIR	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:23.279	f	f	\N	2026-07-07 13:08:23.279
1705	TPT-040/2026/205	59	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CHARGESHEET	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:24.085	f	f	\N	2026-07-07 13:08:24.085
1706	TP-WEST/2026/206	2	Sec. 27 of NDPS Act	2026-04-10	TRIAL	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:24.943	f	f	\N	2026-07-07 13:08:24.943
1707	TP-WEST/2026/207	2	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CONVICTED	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:25.832	f	f	\N	2026-07-07 13:08:25.832
1708	TPT-044/2026/208	63	Sec. 27 of NDPS Act	2026-05-10	FIR	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:26.623	f	f	\N	2026-07-07 13:08:26.623
1709	TPT-044/2026/209	63	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CHARGESHEET	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:27.496	f	f	\N	2026-07-07 13:08:27.496
1710	TPT-045/2026/210	64	Sec. 27 of NDPS Act	2026-01-10	TRIAL	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:28.391	f	f	\N	2026-07-07 13:08:28.391
1711	TPT-045/2026/211	64	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CONVICTED	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:29.14	f	f	\N	2026-07-07 13:08:29.14
1712	TPT-046/2026/212	65	Sec. 27 of NDPS Act	2026-02-10	FIR	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:30.022	f	f	\N	2026-07-07 13:08:30.022
1713	TPT-046/2026/213	65	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CHARGESHEET	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:30.903	f	f	\N	2026-07-07 13:08:30.903
1714	TPT-050/2026/214	69	Sec. 27 of NDPS Act	2026-03-10	TRIAL	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:31.728	f	f	\N	2026-07-07 13:08:31.728
1715	TPT-050/2026/215	69	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CONVICTED	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:32.613	f	f	\N	2026-07-07 13:08:32.613
1716	TPT-051/2026/216	70	Sec. 27 of NDPS Act	2026-04-10	FIR	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:33.496	f	f	\N	2026-07-07 13:08:33.496
1717	TPT-051/2026/217	70	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CHARGESHEET	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	POLICE	\N	2026-07-07 13:08:34.442	f	f	\N	2026-07-07 13:08:34.442
1718	EX-TPT-U/2026/218	8	Sec. 27 of NDPS Act	2026-05-10	TRIAL	Consumption of Ganja	MDMA	0.130	KG	3000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:08:35.323	f	f	\N	2026-07-07 13:08:35.323
1719	EX-TPT-U/2026/219	8	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-05-11	CONVICTED	Possession & Sale of Contraband	HEROIN	3.500	KG	65000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:08:36.208	f	f	\N	2026-07-07 13:08:36.208
1720	EX-TPT-R/2026/220	9	Sec. 27 of NDPS Act	2026-01-10	FIR	Consumption of Ganja	DRY_GANJA	0.050	KG	1000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:08:37.023	f	f	\N	2026-07-07 13:08:37.023
1721	EX-TPT-R/2026/221	9	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-01-11	CHARGESHEET	Possession & Sale of Contraband	GANJA_OIL	1.500	KG	25000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:08:37.916	f	f	\N	2026-07-07 13:08:37.916
1722	EX-SKHT/2026/222	10	Sec. 27 of NDPS Act	2026-02-10	TRIAL	Consumption of Ganja	BROWN_SUGAR	0.070	KG	1500.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:08:38.799	f	f	\N	2026-07-07 13:08:38.799
1723	EX-SKHT/2026/223	10	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-02-11	CONVICTED	Possession & Sale of Contraband	MDMA	2.000	KG	35000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:08:39.697	f	f	\N	2026-07-07 13:08:39.697
1724	EX-PTR/2026/224	11	Sec. 27 of NDPS Act	2026-03-10	FIR	Consumption of Ganja	HEROIN	0.090	KG	2000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:08:40.488	f	f	\N	2026-07-07 13:08:40.488
1725	EX-PTR/2026/225	11	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-03-11	CHARGESHEET	Possession & Sale of Contraband	DRY_GANJA	2.500	KG	45000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:08:41.3	f	f	\N	2026-07-07 13:08:41.3
1726	EX-NGLP/2026/226	12	Sec. 27 of NDPS Act	2026-04-10	TRIAL	Consumption of Ganja	GANJA_OIL	0.110	KG	2500.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:08:42.128	f	f	\N	2026-07-07 13:08:42.128
1727	EX-NGLP/2026/227	12	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act	2026-04-11	CONVICTED	Possession & Sale of Contraband	BROWN_SUGAR	3.000	KG	55000.00	Tirupati Area	Local distribution	\N	EXCISE	\N	2026-07-07 13:08:43.082	f	f	\N	2026-07-07 13:08:43.082
1728	CROSS/2026/001	1	Sec. 8(c) r/w 20(b)(ii)(C) of NDPS Act	2026-06-15	FIR	Inter-district smuggling and distribution	DRY_GANJA	25.500	KG	500000.00	Odisha Border	Multiple districts in AP	\N	POLICE	\N	2026-07-07 13:08:43.294	f	f	\N	2026-07-07 13:08:43.294
\.


--
-- Data for Name: charge_sheets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.charge_sheets (id, case_id, expected_submission_date, actual_submission_date, missing_documents, prosecutor_name, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: courier_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courier_checks (id, ps_id, officer_id, courier_office_name, location, manager_name, checked_register, checked_suspicious_parcels, scanned_parcels_count, no_suspicious_activity, findings_notes, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
1	1	4	DTDC	\N	\N	t	f	\N	f	\N	13.6710371	79.3957916	\N	2026-06-14 12:46:17.588
2	1	5	DTDC	\N	\N	t	f	\N	f	\N	13.6517075	79.3888203	\N	2026-06-14 12:46:19.243
3	1	7	DTDC	\N	\N	t	f	\N	f	\N	13.6637701	79.4198357	\N	2026-06-14 12:46:19.857
4	8	8	DTDC	\N	\N	t	f	\N	f	\N	13.5839395	79.3836981	\N	2026-06-14 12:46:20.463
5	42	33	DTDC	\N	\N	t	f	\N	f	\N	13.6358594	79.4648623	\N	2026-06-14 12:46:21.082
\.


--
-- Data for Name: court_hearings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.court_hearings (id, case_id, sc_number, court_name, hearing_date, judge_name, order_text, next_hearing_date, created_at) FROM stdin;
\.


--
-- Data for Name: deletion_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deletion_requests (id, entity_type, entity_id, reason, status, flagged_by, flagged_at, escalated_by, escalated_at, requested_by, requested_at, approved_by, approved_at, deleted_by, deleted_at, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.districts (id, name, state, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: divisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.divisions (id, name, code, district, sdpo_name, is_active, created_at) FROM stdin;
1	Tirupati Urban	Tirupati SDPO	Tirupati	\N	t	2026-06-23 14:26:21.834
2	Tirupati Rural	Chandragiri SDPO	Tirupati	\N	t	2026-06-23 14:26:22.354
3	Srikalahasti	Srikalahasti SDPO	Tirupati	\N	t	2026-06-23 14:26:22.676
4	Puttur	Puttur SDPO	Tirupati	\N	t	2026-06-23 14:26:22.999
5	Naidupeta	Naidupet SDPO	Tirupati	\N	t	2026-06-23 14:26:23.331
6	Renigunta	Renigunta SDPO	Tirupati	\N	t	2026-06-23 14:26:23.655
7	Tirumala	Tirumala SDPO	Tirupati	\N	t	2026-06-23 14:26:23.978
8	Sri City	Sri City SDPO	Tirupati	\N	t	2026-06-23 14:26:24.302
\.


--
-- Data for Name: drone_surveillance_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.drone_surveillance_checks (id, ps_id, officer_id, area_name, drone_operator, area_scanned_sqm, ganja_detected, findings_notes, no_suspicious_activity, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
2	1	4	Seshachalam Forest Edge	\N	\N	f	\N	f	13.6413194	79.4511374	\N	2026-06-14 12:46:18.407
3	1	5	Seshachalam Forest Edge	\N	\N	f	\N	f	13.5881844	79.4295341	\N	2026-06-14 12:46:19.436
4	1	7	Seshachalam Forest Edge	\N	\N	f	\N	f	13.5853684	79.4175583	\N	2026-06-14 12:46:20.047
5	8	8	Seshachalam Forest Edge	\N	\N	f	\N	f	13.5903341	79.4678342	\N	2026-06-14 12:46:20.653
6	42	33	Seshachalam Forest Edge	\N	\N	f	\N	f	13.5792568	79.4114730	\N	2026-06-14 12:46:21.269
\.


--
-- Data for Name: drunk_drive_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.drunk_drive_checks (id, ps_id, officer_id, vehicle_no, driver_name, driver_age, driver_gender, bac_level, fine_amount, vehicle_impounded, no_suspicious_activity, remarks, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
1	1	4	AP03 BL 1234	Ramesh	\N	\N	45.50	10000.00	f	f	\N	13.6487984	79.4215940	\N	2026-06-14 12:46:16.256
2	1	5	AP03 BL 1234	Ramesh	\N	\N	45.50	10000.00	f	f	\N	13.6497498	79.4405017	\N	2026-06-14 12:46:18.815
3	1	7	AP03 BL 1234	Ramesh	\N	\N	45.50	10000.00	f	f	\N	13.6364688	79.4408854	\N	2026-06-14 12:46:19.575
4	8	8	AP03 BL 1234	Ramesh	\N	\N	45.50	10000.00	f	f	\N	13.6298162	79.4371218	\N	2026-06-14 12:46:20.187
5	42	33	AP03 BL 1234	Ramesh	\N	\N	45.50	10000.00	f	f	\N	13.5806318	79.4463939	\N	2026-06-14 12:46:20.801
\.


--
-- Data for Name: edit_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.edit_requests (id, entity_type, entity_id, changes_json, reason, status, requested_by, requested_at, approved_by, approved_at, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: enforcement_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.enforcement_checks (id, subject_name, subject_age, subject_gender, subject_aadhaar, photo_url, place_of_enforcement, district, ndps_match, matched_offender_id, criminal_record_found, lookup_summary, test_result, consumption_type, status, created_by, ps_id, reviewed_by, reviewed_at, review_notes, committed_offender_id, created_at, updated_at, subject_address, subject_father_name, subject_landmark, subject_occupation, subject_pan, subject_phone, geo_lat, geo_lng) FROM stdin;
\.


--
-- Data for Name: finance_upload_batches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_upload_batches (id, uploaded_by, offender_id, file_name, file_type, statement_month, bank_name, account_no, upi_id, total_records, status, error_log, created_at) FROM stdin;
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
\.


--
-- Data for Name: imei_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.imei_records (id, offender_id, imei_number, device_make, device_model, sim_number, sim_provider, mobile_number, status, first_seen, last_seen, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: informers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.informers (id, code_name, phone, rating, status, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: intelligence_inputs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.intelligence_inputs (id, offender_id, ps_id, source_type, input_text, supply_route, created_by, created_at, informer_id) FROM stdin;
\.


--
-- Data for Name: interrogation_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interrogation_sessions (id, offender_id, case_id, officer_id, session_at, source_info, purchase_price, selling_price, delivery_mode, payment_mode, network_members, mobiles_disclosed, intel_inputs, notes, created_at) FROM stdin;
\.


--
-- Data for Name: lodge_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lodge_checks (id, ps_id, officer_id, lodge_name, owner_name, manager_name, location, check_date, checked_guest_register, verified_foreigners, verified_strangers, verified_suspicious, no_suspicious_activity, findings_notes, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
1	1	4	sfdgrn	\N	fdgdbrt	nteyune	2026-06-10 14:23:13.784	t	t	t	t	t	\N	13.6185523	79.4027308	\N	2026-06-10 14:23:13.784
2	1	4	Sri Balaji Residency	\N	Kumar	\N	2026-06-14 12:46:16.153	t	f	f	f	f	\N	13.5809324	79.4047746	\N	2026-06-14 12:46:16.153
3	1	5	Sri Balaji Residency	\N	Kumar	\N	2026-06-14 12:46:18.714	t	f	f	f	f	\N	13.6319406	79.4288071	\N	2026-06-14 12:46:18.714
4	1	7	Sri Balaji Residency	\N	Kumar	\N	2026-06-14 12:46:19.529	t	f	f	f	f	\N	13.6392947	79.3847539	\N	2026-06-14 12:46:19.529
5	8	8	Sri Balaji Residency	\N	Kumar	\N	2026-06-14 12:46:20.142	t	f	f	f	f	\N	13.6539488	79.3842044	\N	2026-06-14 12:46:20.142
6	42	33	Sri Balaji Residency	\N	Kumar	\N	2026-06-14 12:46:20.755	t	f	f	f	f	\N	13.6041225	79.4429065	\N	2026-06-14 12:46:20.755
\.


--
-- Data for Name: messaging_intel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messaging_intel (id, offender_id, platform, source_type, disposition, input_text, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: mv_act_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mv_act_checks (id, ps_id, officer_id, vehicle_no, driver_name, violation_type, fine_amount, challan_no, remarks, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
2	1	4	AP03 AB 5555	Venkat	No Helmet	1035.00	\N	\N	13.6141604	79.4569587	\N	2026-06-14 12:46:16.767
3	1	5	AP03 AB 5555	Venkat	No Helmet	1035.00	\N	\N	13.6252780	79.4675858	\N	2026-06-14 12:46:19.023
4	1	7	AP03 AB 5555	Venkat	No Helmet	1035.00	\N	\N	13.6660992	79.3712297	\N	2026-06-14 12:46:19.669
5	8	8	AP03 AB 5555	Venkat	No Helmet	1035.00	\N	\N	13.6220196	79.3953352	\N	2026-06-14 12:46:20.28
6	42	33	AP03 AB 5555	Venkat	No Helmet	1035.00	\N	\N	13.5939318	79.4305892	\N	2026-06-14 12:46:20.894
\.


--
-- Data for Name: offender_contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offender_contacts (id, offender_id, contact_type, value, notes, created_at) FROM stdin;
3361	2771	MOBILE_PRIMARY	9848010000	Primary mobile number	2026-07-07 13:06:52.794
3362	2771	WHATSAPP	9848010000	Active WhatsApp number	2026-07-07 13:06:52.794
3363	2771	GMAIL	ramesh.babu.0.0@gmail.com	Primary email	2026-07-07 13:06:52.794
3364	2772	MOBILE_PRIMARY	9848010013	Primary mobile number	2026-07-07 13:06:54.126
3365	2772	WHATSAPP	9848010013	Active WhatsApp number	2026-07-07 13:06:54.126
3366	2772	GMAIL	suresh.prasad.0.1@gmail.com	Primary email	2026-07-07 13:06:54.126
3367	2773	MOBILE_PRIMARY	9848010027	Primary mobile number	2026-07-07 13:06:55.059
3368	2773	WHATSAPP	9848010027	Active WhatsApp number	2026-07-07 13:06:55.059
3369	2773	GMAIL	manoj.reddy.1.0@gmail.com	Primary email	2026-07-07 13:06:55.059
3370	2774	MOBILE_PRIMARY	9848010040	Primary mobile number	2026-07-07 13:06:55.967
3371	2774	WHATSAPP	9848010040	Active WhatsApp number	2026-07-07 13:06:55.967
3372	2774	GMAIL	venkat.singh.1.1@gmail.com	Primary email	2026-07-07 13:06:55.967
3373	2775	MOBILE_PRIMARY	9848010054	Primary mobile number	2026-07-07 13:06:56.832
3374	2775	WHATSAPP	9848010054	Active WhatsApp number	2026-07-07 13:06:56.832
3375	2775	GMAIL	rajesh.achari.2.0@gmail.com	Primary email	2026-07-07 13:06:56.832
3376	2776	MOBILE_PRIMARY	9848010067	Primary mobile number	2026-07-07 13:06:57.713
3377	2776	WHATSAPP	9848010067	Active WhatsApp number	2026-07-07 13:06:57.713
3378	2776	GMAIL	prakash.varma.2.1@gmail.com	Primary email	2026-07-07 13:06:57.713
3379	2777	MOBILE_PRIMARY	9848010081	Primary mobile number	2026-07-07 13:06:58.585
3380	2777	WHATSAPP	9848010081	Active WhatsApp number	2026-07-07 13:06:58.585
3381	2777	GMAIL	anil.chakravarthy.3.0@gmail.com	Primary email	2026-07-07 13:06:58.585
3382	2778	MOBILE_PRIMARY	9848010094	Primary mobile number	2026-07-07 13:06:59.518
3383	2778	WHATSAPP	9848010094	Active WhatsApp number	2026-07-07 13:06:59.518
3384	2778	GMAIL	srinivas.patnaik.3.1@gmail.com	Primary email	2026-07-07 13:06:59.518
3385	2779	MOBILE_PRIMARY	9848010108	Primary mobile number	2026-07-07 13:07:00.333
3386	2779	WHATSAPP	9848010108	Active WhatsApp number	2026-07-07 13:07:00.333
3387	2779	GMAIL	bhaskar.murthy.4.0@gmail.com	Primary email	2026-07-07 13:07:00.333
3388	2780	MOBILE_PRIMARY	9848010121	Primary mobile number	2026-07-07 13:07:01.136
3389	2780	WHATSAPP	9848010121	Active WhatsApp number	2026-07-07 13:07:01.136
3390	2780	GMAIL	naveen.shekar.4.1@gmail.com	Primary email	2026-07-07 13:07:01.136
3391	2781	MOBILE_PRIMARY	9848010135	Primary mobile number	2026-07-07 13:07:02.053
3392	2781	WHATSAPP	9848010135	Active WhatsApp number	2026-07-07 13:07:02.053
3393	2781	GMAIL	ganesh.nayak.5.0@gmail.com	Primary email	2026-07-07 13:07:02.053
3394	2782	MOBILE_PRIMARY	9848010148	Primary mobile number	2026-07-07 13:07:02.932
3395	2782	WHATSAPP	9848010148	Active WhatsApp number	2026-07-07 13:07:02.932
3396	2782	GMAIL	vijay.babu.5.1@gmail.com	Primary email	2026-07-07 13:07:02.932
3397	2783	MOBILE_PRIMARY	9848010162	Primary mobile number	2026-07-07 13:07:03.818
3398	2783	WHATSAPP	9848010162	Active WhatsApp number	2026-07-07 13:07:03.818
3399	2783	GMAIL	siva.swamy.6.0@gmail.com	Primary email	2026-07-07 13:07:03.818
3400	2784	MOBILE_PRIMARY	9848010175	Primary mobile number	2026-07-07 13:07:04.695
3401	2784	WHATSAPP	9848010175	Active WhatsApp number	2026-07-07 13:07:04.695
3402	2784	GMAIL	hari.reddy.6.1@gmail.com	Primary email	2026-07-07 13:07:04.695
3403	2785	MOBILE_PRIMARY	9848010189	Primary mobile number	2026-07-07 13:07:05.575
3404	2785	WHATSAPP	9848010189	Active WhatsApp number	2026-07-07 13:07:05.575
3405	2785	GMAIL	nagaraju.pratap.7.0@gmail.com	Primary email	2026-07-07 13:07:05.575
3406	2786	MOBILE_PRIMARY	9848010202	Primary mobile number	2026-07-07 13:07:06.458
3407	2786	WHATSAPP	9848010202	Active WhatsApp number	2026-07-07 13:07:06.458
3408	2786	GMAIL	prasad.achari.7.1@gmail.com	Primary email	2026-07-07 13:07:06.458
3409	2787	MOBILE_PRIMARY	9848010216	Primary mobile number	2026-07-07 13:07:07.27
3410	2787	WHATSAPP	9848010216	Active WhatsApp number	2026-07-07 13:07:07.27
3411	2787	GMAIL	chandra.gowd.8.0@gmail.com	Primary email	2026-07-07 13:07:07.27
3412	2788	MOBILE_PRIMARY	9848010229	Primary mobile number	2026-07-07 13:07:08.069
3413	2788	WHATSAPP	9848010229	Active WhatsApp number	2026-07-07 13:07:08.069
3414	2788	GMAIL	madhava.chakravarthy.8.1@gmail.com	Primary email	2026-07-07 13:07:08.069
3415	2789	MOBILE_PRIMARY	9848010243	Primary mobile number	2026-07-07 13:07:08.944
3416	2789	WHATSAPP	9848010243	Active WhatsApp number	2026-07-07 13:07:08.944
3417	2789	GMAIL	ravindra.rao.9.0@gmail.com	Primary email	2026-07-07 13:07:08.944
3418	2790	MOBILE_PRIMARY	9848010256	Primary mobile number	2026-07-07 13:07:09.83
3419	2790	WHATSAPP	9848010256	Active WhatsApp number	2026-07-07 13:07:09.83
3420	2790	GMAIL	kalyan.murthy.9.1@gmail.com	Primary email	2026-07-07 13:07:09.83
3421	2791	MOBILE_PRIMARY	9848010270	Primary mobile number	2026-07-07 13:07:10.774
3422	2791	WHATSAPP	9848010270	Active WhatsApp number	2026-07-07 13:07:10.774
3423	2791	GMAIL	sudhakar.shankar.10.0@gmail.com	Primary email	2026-07-07 13:07:10.774
3424	2792	MOBILE_PRIMARY	9848010283	Primary mobile number	2026-07-07 13:07:11.579
3425	2792	WHATSAPP	9848010283	Active WhatsApp number	2026-07-07 13:07:11.579
3426	2792	GMAIL	narendra.nayak.10.1@gmail.com	Primary email	2026-07-07 13:07:11.579
3427	2793	MOBILE_PRIMARY	9848010297	Primary mobile number	2026-07-07 13:07:12.394
3428	2793	WHATSAPP	9848010297	Active WhatsApp number	2026-07-07 13:07:12.394
3429	2793	GMAIL	mohan.sastry.11.0@gmail.com	Primary email	2026-07-07 13:07:12.394
3430	2794	MOBILE_PRIMARY	9848010310	Primary mobile number	2026-07-07 13:07:13.267
3431	2794	WHATSAPP	9848010310	Active WhatsApp number	2026-07-07 13:07:13.267
3432	2794	GMAIL	jaya.swamy.11.1@gmail.com	Primary email	2026-07-07 13:07:13.267
3433	2795	MOBILE_PRIMARY	9848010324	Primary mobile number	2026-07-07 13:07:14.144
3434	2795	WHATSAPP	9848010324	Active WhatsApp number	2026-07-07 13:07:14.144
3435	2795	GMAIL	gangadhar.raju.12.0@gmail.com	Primary email	2026-07-07 13:07:14.144
3436	2796	MOBILE_PRIMARY	9848010337	Primary mobile number	2026-07-07 13:07:15.021
3437	2796	WHATSAPP	9848010337	Active WhatsApp number	2026-07-07 13:07:15.021
3478	2810	MOBILE_PRIMARY	9848010526	Primary mobile number	2026-07-07 13:07:27.06
3479	2810	WHATSAPP	9848010526	Active WhatsApp number	2026-07-07 13:07:27.06
3480	2810	GMAIL	ravi.teja.19.1@gmail.com	Primary email	2026-07-07 13:07:27.06
3481	2811	MOBILE_PRIMARY	9848010540	Primary mobile number	2026-07-07 13:07:27.868
3482	2811	WHATSAPP	9848010540	Active WhatsApp number	2026-07-07 13:07:27.868
3483	2811	GMAIL	koti.patnaik.20.0@gmail.com	Primary email	2026-07-07 13:07:27.868
3484	2812	MOBILE_PRIMARY	9848010553	Primary mobile number	2026-07-07 13:07:28.755
3485	2812	WHATSAPP	9848010553	Active WhatsApp number	2026-07-07 13:07:28.755
3486	2812	GMAIL	vamsi.kumar.20.1@gmail.com	Primary email	2026-07-07 13:07:28.755
3487	2813	MOBILE_PRIMARY	9848010567	Primary mobile number	2026-07-07 13:07:29.637
3488	2813	WHATSAPP	9848010567	Active WhatsApp number	2026-07-07 13:07:29.637
3489	2813	GMAIL	apparao.shekar.21.0@gmail.com	Primary email	2026-07-07 13:07:29.637
3490	2814	MOBILE_PRIMARY	9848010580	Primary mobile number	2026-07-07 13:07:30.449
3491	2814	WHATSAPP	9848010580	Active WhatsApp number	2026-07-07 13:07:30.449
3492	2814	GMAIL	konda.naidu.21.1@gmail.com	Primary email	2026-07-07 13:07:30.449
3493	2815	MOBILE_PRIMARY	9848010594	Primary mobile number	2026-07-07 13:07:31.319
3494	2815	WHATSAPP	9848010594	Active WhatsApp number	2026-07-07 13:07:31.319
3495	2815	GMAIL	chaitu.babu.22.0@gmail.com	Primary email	2026-07-07 13:07:31.319
3496	2816	MOBILE_PRIMARY	9848010607	Primary mobile number	2026-07-07 13:07:32.14
3497	2816	WHATSAPP	9848010607	Active WhatsApp number	2026-07-07 13:07:32.14
3498	2816	GMAIL	babji.prasad.22.1@gmail.com	Primary email	2026-07-07 13:07:32.14
3499	2817	MOBILE_PRIMARY	9848010621	Primary mobile number	2026-07-07 13:07:33.037
3500	2817	WHATSAPP	9848010621	Active WhatsApp number	2026-07-07 13:07:33.037
3501	2817	GMAIL	ramesh.reddy.23.0@gmail.com	Primary email	2026-07-07 13:07:33.037
3502	2818	MOBILE_PRIMARY	9848010634	Primary mobile number	2026-07-07 13:07:33.853
3503	2818	WHATSAPP	9848010634	Active WhatsApp number	2026-07-07 13:07:33.853
3504	2818	GMAIL	suresh.singh.23.1@gmail.com	Primary email	2026-07-07 13:07:33.853
3505	2819	MOBILE_PRIMARY	9848010648	Primary mobile number	2026-07-07 13:07:34.671
3506	2819	WHATSAPP	9848010648	Active WhatsApp number	2026-07-07 13:07:34.671
3507	2819	GMAIL	manoj.achari.24.0@gmail.com	Primary email	2026-07-07 13:07:34.671
3508	2820	MOBILE_PRIMARY	9848010661	Primary mobile number	2026-07-07 13:07:35.556
3509	2820	WHATSAPP	9848010661	Active WhatsApp number	2026-07-07 13:07:35.556
3510	2820	GMAIL	venkat.varma.24.1@gmail.com	Primary email	2026-07-07 13:07:35.556
3511	2821	MOBILE_PRIMARY	9848010675	Primary mobile number	2026-07-07 13:07:36.427
3512	2821	WHATSAPP	9848010675	Active WhatsApp number	2026-07-07 13:07:36.427
3513	2821	GMAIL	rajesh.chakravarthy.25.0@gmail.com	Primary email	2026-07-07 13:07:36.427
3438	2796	GMAIL	balaji.pratap.12.1@gmail.com	Primary email	2026-07-07 13:07:15.021
3439	2797	MOBILE_PRIMARY	9848010351	Primary mobile number	2026-07-07 13:07:15.902
3440	2797	WHATSAPP	9848010351	Active WhatsApp number	2026-07-07 13:07:15.902
3441	2797	GMAIL	subramanyam.choudhary.13.0@gmail.com	Primary email	2026-07-07 13:07:15.902
3442	2798	MOBILE_PRIMARY	9848010364	Primary mobile number	2026-07-07 13:07:16.723
3443	2798	WHATSAPP	9848010364	Active WhatsApp number	2026-07-07 13:07:16.723
3444	2798	GMAIL	lokesh.gowd.13.1@gmail.com	Primary email	2026-07-07 13:07:16.723
3445	2799	MOBILE_PRIMARY	9848010378	Primary mobile number	2026-07-07 13:07:17.546
3514	2822	MOBILE_PRIMARY	9848010688	Primary mobile number	2026-07-07 13:07:37.302
3515	2822	WHATSAPP	9848010688	Active WhatsApp number	2026-07-07 13:07:37.302
3516	2822	GMAIL	prakash.patnaik.25.1@gmail.com	Primary email	2026-07-07 13:07:37.302
3517	2823	MOBILE_PRIMARY	9848010702	Primary mobile number	2026-07-07 13:07:38.107
3518	2823	WHATSAPP	9848010702	Active WhatsApp number	2026-07-07 13:07:38.107
3519	2823	GMAIL	anil.murthy.26.0@gmail.com	Primary email	2026-07-07 13:07:38.107
3520	2824	MOBILE_PRIMARY	9848010715	Primary mobile number	2026-07-07 13:07:38.915
3521	2824	WHATSAPP	9848010715	Active WhatsApp number	2026-07-07 13:07:38.915
3522	2824	GMAIL	srinivas.shekar.26.1@gmail.com	Primary email	2026-07-07 13:07:38.915
3523	2825	MOBILE_PRIMARY	9848010729	Primary mobile number	2026-07-07 13:07:39.805
3524	2825	WHATSAPP	9848010729	Active WhatsApp number	2026-07-07 13:07:39.805
3525	2825	GMAIL	bhaskar.nayak.27.0@gmail.com	Primary email	2026-07-07 13:07:39.805
3526	2826	MOBILE_PRIMARY	9848010742	Primary mobile number	2026-07-07 13:07:40.602
3527	2826	WHATSAPP	9848010742	Active WhatsApp number	2026-07-07 13:07:40.602
3528	2826	GMAIL	naveen.babu.27.1@gmail.com	Primary email	2026-07-07 13:07:40.602
3446	2799	WHATSAPP	9848010378	Active WhatsApp number	2026-07-07 13:07:17.546
3447	2799	GMAIL	naresh.teja.14.0@gmail.com	Primary email	2026-07-07 13:07:17.546
3448	2800	MOBILE_PRIMARY	9848010391	Primary mobile number	2026-07-07 13:07:18.348
3449	2800	WHATSAPP	9848010391	Active WhatsApp number	2026-07-07 13:07:18.348
3450	2800	GMAIL	ramana.rao.14.1@gmail.com	Primary email	2026-07-07 13:07:18.348
3451	2801	MOBILE_PRIMARY	9848010405	Primary mobile number	2026-07-07 13:07:19.25
3452	2801	WHATSAPP	9848010405	Active WhatsApp number	2026-07-07 13:07:19.25
3453	2801	GMAIL	krishna.kumar.15.0@gmail.com	Primary email	2026-07-07 13:07:19.25
3454	2802	MOBILE_PRIMARY	9848010418	Primary mobile number	2026-07-07 13:07:20.074
3455	2802	WHATSAPP	9848010418	Active WhatsApp number	2026-07-07 13:07:20.074
3456	2802	GMAIL	anand.shankar.15.1@gmail.com	Primary email	2026-07-07 13:07:20.074
3457	2803	MOBILE_PRIMARY	9848010432	Primary mobile number	2026-07-07 13:07:20.883
3458	2803	WHATSAPP	9848010432	Active WhatsApp number	2026-07-07 13:07:20.883
3459	2803	GMAIL	mahesh.naidu.16.0@gmail.com	Primary email	2026-07-07 13:07:20.883
3460	2804	MOBILE_PRIMARY	9848010445	Primary mobile number	2026-07-07 13:07:21.697
3461	2804	WHATSAPP	9848010445	Active WhatsApp number	2026-07-07 13:07:21.697
3462	2804	GMAIL	kiran.sastry.16.1@gmail.com	Primary email	2026-07-07 13:07:21.697
3463	2805	MOBILE_PRIMARY	9848010459	Primary mobile number	2026-07-07 13:07:22.58
3464	2805	WHATSAPP	9848010459	Active WhatsApp number	2026-07-07 13:07:22.58
3465	2805	GMAIL	satish.prasad.17.0@gmail.com	Primary email	2026-07-07 13:07:22.58
3466	2806	MOBILE_PRIMARY	9848010472	Primary mobile number	2026-07-07 13:07:23.472
3467	2806	WHATSAPP	9848010472	Active WhatsApp number	2026-07-07 13:07:23.472
3468	2806	GMAIL	raju.raju.17.1@gmail.com	Primary email	2026-07-07 13:07:23.472
3469	2807	MOBILE_PRIMARY	9848010486	Primary mobile number	2026-07-07 13:07:24.345
3470	2807	WHATSAPP	9848010486	Active WhatsApp number	2026-07-07 13:07:24.345
3471	2807	GMAIL	gopal.singh.18.0@gmail.com	Primary email	2026-07-07 13:07:24.345
3472	2808	MOBILE_PRIMARY	9848010499	Primary mobile number	2026-07-07 13:07:25.24
3473	2808	WHATSAPP	9848010499	Active WhatsApp number	2026-07-07 13:07:25.24
3474	2808	GMAIL	sekhar.choudhary.18.1@gmail.com	Primary email	2026-07-07 13:07:25.24
3475	2809	MOBILE_PRIMARY	9848010513	Primary mobile number	2026-07-07 13:07:26.18
3476	2809	WHATSAPP	9848010513	Active WhatsApp number	2026-07-07 13:07:26.18
3477	2809	GMAIL	pavan.varma.19.0@gmail.com	Primary email	2026-07-07 13:07:26.18
3529	2827	MOBILE_PRIMARY	9848010756	Primary mobile number	2026-07-07 13:07:41.527
3530	2827	WHATSAPP	9848010756	Active WhatsApp number	2026-07-07 13:07:41.527
3531	2827	GMAIL	ganesh.swamy.28.0@gmail.com	Primary email	2026-07-07 13:07:41.527
3532	2828	MOBILE_PRIMARY	9848010769	Primary mobile number	2026-07-07 13:07:42.345
3533	2828	WHATSAPP	9848010769	Active WhatsApp number	2026-07-07 13:07:42.345
3534	2828	GMAIL	vijay.reddy.28.1@gmail.com	Primary email	2026-07-07 13:07:42.345
3535	2829	MOBILE_PRIMARY	9848010783	Primary mobile number	2026-07-07 13:07:43.203
3536	2829	WHATSAPP	9848010783	Active WhatsApp number	2026-07-07 13:07:43.203
3537	2829	GMAIL	siva.pratap.29.0@gmail.com	Primary email	2026-07-07 13:07:43.203
3538	2830	MOBILE_PRIMARY	9848010796	Primary mobile number	2026-07-07 13:07:44.08
3539	2830	WHATSAPP	9848010796	Active WhatsApp number	2026-07-07 13:07:44.08
3540	2830	GMAIL	hari.achari.29.1@gmail.com	Primary email	2026-07-07 13:07:44.08
3541	2831	MOBILE_PRIMARY	9848010810	Primary mobile number	2026-07-07 13:07:44.812
3542	2831	WHATSAPP	9848010810	Active WhatsApp number	2026-07-07 13:07:44.812
3543	2831	GMAIL	nagaraju.gowd.30.0@gmail.com	Primary email	2026-07-07 13:07:44.812
3544	2832	MOBILE_PRIMARY	9848010823	Primary mobile number	2026-07-07 13:07:45.629
3545	2832	WHATSAPP	9848010823	Active WhatsApp number	2026-07-07 13:07:45.629
3546	2832	GMAIL	prasad.chakravarthy.30.1@gmail.com	Primary email	2026-07-07 13:07:45.629
3547	2833	MOBILE_PRIMARY	9848010837	Primary mobile number	2026-07-07 13:07:46.425
3548	2833	WHATSAPP	9848010837	Active WhatsApp number	2026-07-07 13:07:46.425
3549	2833	GMAIL	chandra.rao.31.0@gmail.com	Primary email	2026-07-07 13:07:46.425
3550	2834	MOBILE_PRIMARY	9848010850	Primary mobile number	2026-07-07 13:07:47.298
3551	2834	WHATSAPP	9848010850	Active WhatsApp number	2026-07-07 13:07:47.298
3552	2834	GMAIL	madhava.murthy.31.1@gmail.com	Primary email	2026-07-07 13:07:47.298
3553	2835	MOBILE_PRIMARY	9848010864	Primary mobile number	2026-07-07 13:07:48.156
3554	2835	WHATSAPP	9848010864	Active WhatsApp number	2026-07-07 13:07:48.156
3555	2835	GMAIL	ravindra.shankar.32.0@gmail.com	Primary email	2026-07-07 13:07:48.156
3556	2836	MOBILE_PRIMARY	9848010877	Primary mobile number	2026-07-07 13:07:49.019
3557	2836	WHATSAPP	9848010877	Active WhatsApp number	2026-07-07 13:07:49.019
3558	2836	GMAIL	kalyan.nayak.32.1@gmail.com	Primary email	2026-07-07 13:07:49.019
3559	2837	MOBILE_PRIMARY	9848010891	Primary mobile number	2026-07-07 13:07:49.882
3560	2837	WHATSAPP	9848010891	Active WhatsApp number	2026-07-07 13:07:49.882
3561	2837	GMAIL	sudhakar.sastry.33.0@gmail.com	Primary email	2026-07-07 13:07:49.882
3562	2838	MOBILE_PRIMARY	9848010904	Primary mobile number	2026-07-07 13:07:50.698
3563	2838	WHATSAPP	9848010904	Active WhatsApp number	2026-07-07 13:07:50.698
3564	2838	GMAIL	narendra.swamy.33.1@gmail.com	Primary email	2026-07-07 13:07:50.698
3565	2839	MOBILE_PRIMARY	9848010918	Primary mobile number	2026-07-07 13:07:51.563
3566	2839	WHATSAPP	9848010918	Active WhatsApp number	2026-07-07 13:07:51.563
3567	2839	GMAIL	mohan.raju.34.0@gmail.com	Primary email	2026-07-07 13:07:51.563
3568	2840	MOBILE_PRIMARY	9848010931	Primary mobile number	2026-07-07 13:07:52.371
3569	2840	WHATSAPP	9848010931	Active WhatsApp number	2026-07-07 13:07:52.371
3570	2840	GMAIL	jaya.pratap.34.1@gmail.com	Primary email	2026-07-07 13:07:52.371
3571	2841	MOBILE_PRIMARY	9848010945	Primary mobile number	2026-07-07 13:07:53.233
3572	2841	WHATSAPP	9848010945	Active WhatsApp number	2026-07-07 13:07:53.233
3573	2841	GMAIL	gangadhar.choudhary.35.0@gmail.com	Primary email	2026-07-07 13:07:53.233
3574	2842	MOBILE_PRIMARY	9848010958	Primary mobile number	2026-07-07 13:07:53.967
3575	2842	WHATSAPP	9848010958	Active WhatsApp number	2026-07-07 13:07:53.967
3576	2842	GMAIL	balaji.gowd.35.1@gmail.com	Primary email	2026-07-07 13:07:53.967
3577	2843	MOBILE_PRIMARY	9848010972	Primary mobile number	2026-07-07 13:07:54.834
3578	2843	WHATSAPP	9848010972	Active WhatsApp number	2026-07-07 13:07:54.834
3579	2843	GMAIL	subramanyam.teja.36.0@gmail.com	Primary email	2026-07-07 13:07:54.834
3580	2844	MOBILE_PRIMARY	9848010985	Primary mobile number	2026-07-07 13:07:55.687
3581	2844	WHATSAPP	9848010985	Active WhatsApp number	2026-07-07 13:07:55.687
3582	2844	GMAIL	lokesh.rao.36.1@gmail.com	Primary email	2026-07-07 13:07:55.687
3583	2845	MOBILE_PRIMARY	9848010999	Primary mobile number	2026-07-07 13:07:56.553
3584	2845	WHATSAPP	9848010999	Active WhatsApp number	2026-07-07 13:07:56.553
3585	2845	GMAIL	naresh.kumar.37.0@gmail.com	Primary email	2026-07-07 13:07:56.553
3586	2846	MOBILE_PRIMARY	9848011012	Primary mobile number	2026-07-07 13:07:57.408
3587	2846	WHATSAPP	9848011012	Active WhatsApp number	2026-07-07 13:07:57.408
3588	2846	GMAIL	ramana.shankar.37.1@gmail.com	Primary email	2026-07-07 13:07:57.408
3589	2847	MOBILE_PRIMARY	9848011026	Primary mobile number	2026-07-07 13:07:58.279
3590	2847	WHATSAPP	9848011026	Active WhatsApp number	2026-07-07 13:07:58.279
3591	2847	GMAIL	krishna.naidu.38.0@gmail.com	Primary email	2026-07-07 13:07:58.279
3592	2848	MOBILE_PRIMARY	9848011039	Primary mobile number	2026-07-07 13:07:59.08
3593	2848	WHATSAPP	9848011039	Active WhatsApp number	2026-07-07 13:07:59.08
3594	2848	GMAIL	anand.sastry.38.1@gmail.com	Primary email	2026-07-07 13:07:59.08
3595	2849	MOBILE_PRIMARY	9848011053	Primary mobile number	2026-07-07 13:07:59.966
3596	2849	WHATSAPP	9848011053	Active WhatsApp number	2026-07-07 13:07:59.966
3597	2849	GMAIL	mahesh.prasad.39.0@gmail.com	Primary email	2026-07-07 13:07:59.966
3598	2850	MOBILE_PRIMARY	9848011066	Primary mobile number	2026-07-07 13:08:00.863
3599	2850	WHATSAPP	9848011066	Active WhatsApp number	2026-07-07 13:08:00.863
3600	2850	GMAIL	kiran.raju.39.1@gmail.com	Primary email	2026-07-07 13:08:00.863
3601	2851	MOBILE_PRIMARY	9848011080	Primary mobile number	2026-07-07 13:08:01.676
3602	2851	WHATSAPP	9848011080	Active WhatsApp number	2026-07-07 13:08:01.676
3603	2851	GMAIL	satish.singh.40.0@gmail.com	Primary email	2026-07-07 13:08:01.676
3604	2852	MOBILE_PRIMARY	9848011093	Primary mobile number	2026-07-07 13:08:02.488
3605	2852	WHATSAPP	9848011093	Active WhatsApp number	2026-07-07 13:08:02.488
3606	2852	GMAIL	raju.choudhary.40.1@gmail.com	Primary email	2026-07-07 13:08:02.488
3607	2853	MOBILE_PRIMARY	9848011107	Primary mobile number	2026-07-07 13:08:03.321
3608	2853	WHATSAPP	9848011107	Active WhatsApp number	2026-07-07 13:08:03.321
3609	2853	GMAIL	gopal.varma.41.0@gmail.com	Primary email	2026-07-07 13:08:03.321
3610	2854	MOBILE_PRIMARY	9848011120	Primary mobile number	2026-07-07 13:08:04.194
3611	2854	WHATSAPP	9848011120	Active WhatsApp number	2026-07-07 13:08:04.194
3612	2854	GMAIL	sekhar.teja.41.1@gmail.com	Primary email	2026-07-07 13:08:04.194
3613	2855	MOBILE_PRIMARY	9848011134	Primary mobile number	2026-07-07 13:08:05.063
3614	2855	WHATSAPP	9848011134	Active WhatsApp number	2026-07-07 13:08:05.063
3615	2855	GMAIL	pavan.patnaik.42.0@gmail.com	Primary email	2026-07-07 13:08:05.063
3616	2856	MOBILE_PRIMARY	9848011147	Primary mobile number	2026-07-07 13:08:05.942
3617	2856	WHATSAPP	9848011147	Active WhatsApp number	2026-07-07 13:08:05.942
3618	2856	GMAIL	ravi.kumar.42.1@gmail.com	Primary email	2026-07-07 13:08:05.942
3619	2857	MOBILE_PRIMARY	9848011161	Primary mobile number	2026-07-07 13:08:06.816
3620	2857	WHATSAPP	9848011161	Active WhatsApp number	2026-07-07 13:08:06.816
3621	2857	GMAIL	koti.shekar.43.0@gmail.com	Primary email	2026-07-07 13:08:06.816
3622	2858	MOBILE_PRIMARY	9848011174	Primary mobile number	2026-07-07 13:08:07.692
3623	2858	WHATSAPP	9848011174	Active WhatsApp number	2026-07-07 13:08:07.692
3624	2858	GMAIL	vamsi.naidu.43.1@gmail.com	Primary email	2026-07-07 13:08:07.692
3625	2859	MOBILE_PRIMARY	9848011188	Primary mobile number	2026-07-07 13:08:08.567
3626	2859	WHATSAPP	9848011188	Active WhatsApp number	2026-07-07 13:08:08.567
3627	2859	GMAIL	apparao.babu.44.0@gmail.com	Primary email	2026-07-07 13:08:08.567
3628	2860	MOBILE_PRIMARY	9848011201	Primary mobile number	2026-07-07 13:08:09.384
3629	2860	WHATSAPP	9848011201	Active WhatsApp number	2026-07-07 13:08:09.384
3630	2860	GMAIL	konda.prasad.44.1@gmail.com	Primary email	2026-07-07 13:08:09.384
3631	2861	MOBILE_PRIMARY	9848011215	Primary mobile number	2026-07-07 13:08:10.539
3632	2861	WHATSAPP	9848011215	Active WhatsApp number	2026-07-07 13:08:10.539
3633	2861	GMAIL	chaitu.reddy.45.0@gmail.com	Primary email	2026-07-07 13:08:10.539
3634	2862	MOBILE_PRIMARY	9848011228	Primary mobile number	2026-07-07 13:08:11.431
3635	2862	WHATSAPP	9848011228	Active WhatsApp number	2026-07-07 13:08:11.431
3636	2862	GMAIL	babji.singh.45.1@gmail.com	Primary email	2026-07-07 13:08:11.431
3637	2863	MOBILE_PRIMARY	9848011242	Primary mobile number	2026-07-07 13:08:12.371
3638	2863	WHATSAPP	9848011242	Active WhatsApp number	2026-07-07 13:08:12.371
3639	2863	GMAIL	ramesh.achari.46.0@gmail.com	Primary email	2026-07-07 13:08:12.371
3640	2864	MOBILE_PRIMARY	9848011255	Primary mobile number	2026-07-07 13:08:13.237
3641	2864	WHATSAPP	9848011255	Active WhatsApp number	2026-07-07 13:08:13.237
3642	2864	GMAIL	suresh.varma.46.1@gmail.com	Primary email	2026-07-07 13:08:13.237
3643	2865	MOBILE_PRIMARY	9848011269	Primary mobile number	2026-07-07 13:08:14.081
3644	2865	WHATSAPP	9848011269	Active WhatsApp number	2026-07-07 13:08:14.081
3645	2865	GMAIL	manoj.chakravarthy.47.0@gmail.com	Primary email	2026-07-07 13:08:14.081
3646	2866	MOBILE_PRIMARY	9848011282	Primary mobile number	2026-07-07 13:08:14.967
3647	2866	WHATSAPP	9848011282	Active WhatsApp number	2026-07-07 13:08:14.967
3648	2866	GMAIL	venkat.patnaik.47.1@gmail.com	Primary email	2026-07-07 13:08:14.967
3649	2867	MOBILE_PRIMARY	9848011296	Primary mobile number	2026-07-07 13:08:15.769
3650	2867	WHATSAPP	9848011296	Active WhatsApp number	2026-07-07 13:08:15.769
3651	2867	GMAIL	rajesh.murthy.48.0@gmail.com	Primary email	2026-07-07 13:08:15.769
3652	2868	MOBILE_PRIMARY	9848011309	Primary mobile number	2026-07-07 13:08:16.58
3653	2868	WHATSAPP	9848011309	Active WhatsApp number	2026-07-07 13:08:16.58
3654	2868	GMAIL	prakash.shekar.48.1@gmail.com	Primary email	2026-07-07 13:08:16.58
3655	2869	MOBILE_PRIMARY	9848011323	Primary mobile number	2026-07-07 13:08:17.401
3656	2869	WHATSAPP	9848011323	Active WhatsApp number	2026-07-07 13:08:17.401
3657	2869	GMAIL	anil.nayak.49.0@gmail.com	Primary email	2026-07-07 13:08:17.401
3658	2870	MOBILE_PRIMARY	9848011336	Primary mobile number	2026-07-07 13:08:18.284
3659	2870	WHATSAPP	9848011336	Active WhatsApp number	2026-07-07 13:08:18.284
3660	2870	GMAIL	srinivas.babu.49.1@gmail.com	Primary email	2026-07-07 13:08:18.284
3661	2871	MOBILE_PRIMARY	9848011350	Primary mobile number	2026-07-07 13:08:19.096
3662	2871	WHATSAPP	9848011350	Active WhatsApp number	2026-07-07 13:08:19.096
3663	2871	GMAIL	bhaskar.swamy.50.0@gmail.com	Primary email	2026-07-07 13:08:19.096
3664	2872	MOBILE_PRIMARY	9848011363	Primary mobile number	2026-07-07 13:08:20.042
3665	2872	WHATSAPP	9848011363	Active WhatsApp number	2026-07-07 13:08:20.042
3666	2872	GMAIL	naveen.reddy.50.1@gmail.com	Primary email	2026-07-07 13:08:20.042
3667	2873	MOBILE_PRIMARY	9848011377	Primary mobile number	2026-07-07 13:08:20.919
3668	2873	WHATSAPP	9848011377	Active WhatsApp number	2026-07-07 13:08:20.919
3669	2873	GMAIL	ganesh.pratap.51.0@gmail.com	Primary email	2026-07-07 13:08:20.919
3670	2874	MOBILE_PRIMARY	9848011390	Primary mobile number	2026-07-07 13:08:21.733
3671	2874	WHATSAPP	9848011390	Active WhatsApp number	2026-07-07 13:08:21.733
3672	2874	GMAIL	vijay.achari.51.1@gmail.com	Primary email	2026-07-07 13:08:21.733
3673	2875	MOBILE_PRIMARY	9848011404	Primary mobile number	2026-07-07 13:08:22.611
3674	2875	WHATSAPP	9848011404	Active WhatsApp number	2026-07-07 13:08:22.611
3675	2875	GMAIL	siva.gowd.52.0@gmail.com	Primary email	2026-07-07 13:08:22.611
3676	2876	MOBILE_PRIMARY	9848011417	Primary mobile number	2026-07-07 13:08:23.49
3677	2876	WHATSAPP	9848011417	Active WhatsApp number	2026-07-07 13:08:23.49
3678	2876	GMAIL	hari.chakravarthy.52.1@gmail.com	Primary email	2026-07-07 13:08:23.49
3679	2877	MOBILE_PRIMARY	9848011431	Primary mobile number	2026-07-07 13:08:24.286
3680	2877	WHATSAPP	9848011431	Active WhatsApp number	2026-07-07 13:08:24.286
3681	2877	GMAIL	nagaraju.rao.53.0@gmail.com	Primary email	2026-07-07 13:08:24.286
3682	2878	MOBILE_PRIMARY	9848011444	Primary mobile number	2026-07-07 13:08:25.153
3683	2878	WHATSAPP	9848011444	Active WhatsApp number	2026-07-07 13:08:25.153
3684	2878	GMAIL	prasad.murthy.53.1@gmail.com	Primary email	2026-07-07 13:08:25.153
3685	2879	MOBILE_PRIMARY	9848011458	Primary mobile number	2026-07-07 13:08:26.041
3686	2879	WHATSAPP	9848011458	Active WhatsApp number	2026-07-07 13:08:26.041
3687	2879	GMAIL	chandra.shankar.54.0@gmail.com	Primary email	2026-07-07 13:08:26.041
3688	2880	MOBILE_PRIMARY	9848011471	Primary mobile number	2026-07-07 13:08:26.892
3689	2880	WHATSAPP	9848011471	Active WhatsApp number	2026-07-07 13:08:26.892
3690	2880	GMAIL	madhava.nayak.54.1@gmail.com	Primary email	2026-07-07 13:08:26.892
3691	2881	MOBILE_PRIMARY	9848011485	Primary mobile number	2026-07-07 13:08:27.707
3692	2881	WHATSAPP	9848011485	Active WhatsApp number	2026-07-07 13:08:27.707
3693	2881	GMAIL	ravindra.sastry.55.0@gmail.com	Primary email	2026-07-07 13:08:27.707
3694	2882	MOBILE_PRIMARY	9848011498	Primary mobile number	2026-07-07 13:08:28.594
3695	2882	WHATSAPP	9848011498	Active WhatsApp number	2026-07-07 13:08:28.594
3696	2882	GMAIL	kalyan.swamy.55.1@gmail.com	Primary email	2026-07-07 13:08:28.594
3697	2883	MOBILE_PRIMARY	9848011512	Primary mobile number	2026-07-07 13:08:29.341
3698	2883	WHATSAPP	9848011512	Active WhatsApp number	2026-07-07 13:08:29.341
3699	2883	GMAIL	sudhakar.raju.56.0@gmail.com	Primary email	2026-07-07 13:08:29.341
3700	2884	MOBILE_PRIMARY	9848011525	Primary mobile number	2026-07-07 13:08:30.23
3701	2884	WHATSAPP	9848011525	Active WhatsApp number	2026-07-07 13:08:30.23
3702	2884	GMAIL	narendra.pratap.56.1@gmail.com	Primary email	2026-07-07 13:08:30.23
3703	2885	MOBILE_PRIMARY	9848011539	Primary mobile number	2026-07-07 13:08:31.123
3704	2885	WHATSAPP	9848011539	Active WhatsApp number	2026-07-07 13:08:31.123
3705	2885	GMAIL	mohan.choudhary.57.0@gmail.com	Primary email	2026-07-07 13:08:31.123
3706	2886	MOBILE_PRIMARY	9848011552	Primary mobile number	2026-07-07 13:08:31.941
3707	2886	WHATSAPP	9848011552	Active WhatsApp number	2026-07-07 13:08:31.941
3708	2886	GMAIL	jaya.gowd.57.1@gmail.com	Primary email	2026-07-07 13:08:31.941
3709	2887	MOBILE_PRIMARY	9848011566	Primary mobile number	2026-07-07 13:08:32.82
3710	2887	WHATSAPP	9848011566	Active WhatsApp number	2026-07-07 13:08:32.82
3711	2887	GMAIL	gangadhar.teja.58.0@gmail.com	Primary email	2026-07-07 13:08:32.82
3712	2888	MOBILE_PRIMARY	9848011579	Primary mobile number	2026-07-07 13:08:33.709
3713	2888	WHATSAPP	9848011579	Active WhatsApp number	2026-07-07 13:08:33.709
3714	2888	GMAIL	balaji.rao.58.1@gmail.com	Primary email	2026-07-07 13:08:33.709
3715	2889	MOBILE_PRIMARY	9848011593	Primary mobile number	2026-07-07 13:08:34.655
3716	2889	WHATSAPP	9848011593	Active WhatsApp number	2026-07-07 13:08:34.655
3717	2889	GMAIL	subramanyam.kumar.59.0@gmail.com	Primary email	2026-07-07 13:08:34.655
3718	2890	MOBILE_PRIMARY	9848011606	Primary mobile number	2026-07-07 13:08:35.535
3719	2890	WHATSAPP	9848011606	Active WhatsApp number	2026-07-07 13:08:35.535
3720	2890	GMAIL	lokesh.shankar.59.1@gmail.com	Primary email	2026-07-07 13:08:35.535
3721	2891	MOBILE_PRIMARY	9848011620	Primary mobile number	2026-07-07 13:08:36.416
3722	2891	WHATSAPP	9848011620	Active WhatsApp number	2026-07-07 13:08:36.416
3723	2891	GMAIL	naresh.naidu.60.0@gmail.com	Primary email	2026-07-07 13:08:36.416
3724	2892	MOBILE_PRIMARY	9848011633	Primary mobile number	2026-07-07 13:08:37.249
3725	2892	WHATSAPP	9848011633	Active WhatsApp number	2026-07-07 13:08:37.249
3726	2892	GMAIL	ramana.sastry.60.1@gmail.com	Primary email	2026-07-07 13:08:37.249
3727	2893	MOBILE_PRIMARY	9848011647	Primary mobile number	2026-07-07 13:08:38.122
3728	2893	WHATSAPP	9848011647	Active WhatsApp number	2026-07-07 13:08:38.122
3729	2893	GMAIL	krishna.prasad.61.0@gmail.com	Primary email	2026-07-07 13:08:38.122
3730	2894	MOBILE_PRIMARY	9848011660	Primary mobile number	2026-07-07 13:08:39.009
3731	2894	WHATSAPP	9848011660	Active WhatsApp number	2026-07-07 13:08:39.009
3732	2894	GMAIL	anand.raju.61.1@gmail.com	Primary email	2026-07-07 13:08:39.009
3733	2895	MOBILE_PRIMARY	9848011674	Primary mobile number	2026-07-07 13:08:39.9
3734	2895	WHATSAPP	9848011674	Active WhatsApp number	2026-07-07 13:08:39.9
3735	2895	GMAIL	mahesh.singh.62.0@gmail.com	Primary email	2026-07-07 13:08:39.9
3736	2896	MOBILE_PRIMARY	9848011687	Primary mobile number	2026-07-07 13:08:40.703
3737	2896	WHATSAPP	9848011687	Active WhatsApp number	2026-07-07 13:08:40.703
3738	2896	GMAIL	kiran.choudhary.62.1@gmail.com	Primary email	2026-07-07 13:08:40.703
3739	2897	MOBILE_PRIMARY	9848011701	Primary mobile number	2026-07-07 13:08:41.508
3740	2897	WHATSAPP	9848011701	Active WhatsApp number	2026-07-07 13:08:41.508
3741	2897	GMAIL	satish.varma.63.0@gmail.com	Primary email	2026-07-07 13:08:41.508
3742	2898	MOBILE_PRIMARY	9848011714	Primary mobile number	2026-07-07 13:08:42.402
3743	2898	WHATSAPP	9848011714	Active WhatsApp number	2026-07-07 13:08:42.402
3744	2898	GMAIL	raju.teja.63.1@gmail.com	Primary email	2026-07-07 13:08:42.402
\.


--
-- Data for Name: offender_drug_profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offender_drug_profile (id, offender_id, addiction_type, consumption_frequency, source_of_procurement, mode_of_purchase, usual_consumption_spot, created_at, updated_at, section_of_law) FROM stdin;
2774	2771	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:06:52.794	2026-07-07 13:06:52.794	Sec. 27 of NDPS Act
2775	2772	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:06:54.126	2026-07-07 13:06:54.126	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2776	2773	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:06:55.059	2026-07-07 13:06:55.059	Sec. 27 of NDPS Act
2777	2774	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:06:55.967	2026-07-07 13:06:55.967	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2778	2775	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:06:56.832	2026-07-07 13:06:56.832	Sec. 27 of NDPS Act
2779	2776	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:06:57.713	2026-07-07 13:06:57.713	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2780	2777	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:06:58.585	2026-07-07 13:06:58.585	Sec. 27 of NDPS Act
2781	2778	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:06:59.518	2026-07-07 13:06:59.518	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2782	2779	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:00.333	2026-07-07 13:07:00.333	Sec. 27 of NDPS Act
2783	2780	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:01.136	2026-07-07 13:07:01.136	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2784	2781	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:02.053	2026-07-07 13:07:02.053	Sec. 27 of NDPS Act
2785	2782	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:02.932	2026-07-07 13:07:02.932	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2786	2783	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:03.818	2026-07-07 13:07:03.818	Sec. 27 of NDPS Act
2787	2784	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:04.695	2026-07-07 13:07:04.695	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2788	2785	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:05.575	2026-07-07 13:07:05.575	Sec. 27 of NDPS Act
2789	2786	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:06.458	2026-07-07 13:07:06.458	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2790	2787	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:07.27	2026-07-07 13:07:07.27	Sec. 27 of NDPS Act
2791	2788	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:08.069	2026-07-07 13:07:08.069	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2792	2789	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:07:08.944	2026-07-07 13:07:08.944	Sec. 27 of NDPS Act
2793	2790	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:07:09.83	2026-07-07 13:07:09.83	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2794	2791	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:10.774	2026-07-07 13:07:10.774	Sec. 27 of NDPS Act
2795	2792	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:11.579	2026-07-07 13:07:11.579	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2796	2793	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:12.394	2026-07-07 13:07:12.394	Sec. 27 of NDPS Act
2797	2794	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:13.267	2026-07-07 13:07:13.267	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2798	2795	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:14.144	2026-07-07 13:07:14.144	Sec. 27 of NDPS Act
2799	2796	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:15.021	2026-07-07 13:07:15.021	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2800	2797	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:15.902	2026-07-07 13:07:15.902	Sec. 27 of NDPS Act
2801	2798	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:16.723	2026-07-07 13:07:16.723	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2802	2799	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:17.546	2026-07-07 13:07:17.546	Sec. 27 of NDPS Act
2803	2800	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:18.348	2026-07-07 13:07:18.348	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2804	2801	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:07:19.25	2026-07-07 13:07:19.25	Sec. 27 of NDPS Act
2805	2802	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:07:20.074	2026-07-07 13:07:20.074	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2806	2803	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:20.883	2026-07-07 13:07:20.883	Sec. 27 of NDPS Act
2807	2804	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:21.697	2026-07-07 13:07:21.697	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2808	2805	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:22.58	2026-07-07 13:07:22.58	Sec. 27 of NDPS Act
2809	2806	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:23.472	2026-07-07 13:07:23.472	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2810	2807	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:24.345	2026-07-07 13:07:24.345	Sec. 27 of NDPS Act
2811	2808	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:25.24	2026-07-07 13:07:25.24	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2812	2809	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:26.18	2026-07-07 13:07:26.18	Sec. 27 of NDPS Act
2883	2880	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:08:26.892	2026-07-07 13:08:26.892	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2884	2881	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:08:27.707	2026-07-07 13:08:27.707	Sec. 27 of NDPS Act
2885	2882	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:08:28.594	2026-07-07 13:08:28.594	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2886	2883	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:08:29.341	2026-07-07 13:08:29.341	Sec. 27 of NDPS Act
2887	2884	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:08:30.23	2026-07-07 13:08:30.23	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2888	2885	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:08:31.123	2026-07-07 13:08:31.123	Sec. 27 of NDPS Act
2889	2886	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:08:31.941	2026-07-07 13:08:31.941	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2890	2887	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:08:32.82	2026-07-07 13:08:32.82	Sec. 27 of NDPS Act
2891	2888	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:08:33.709	2026-07-07 13:08:33.709	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2813	2810	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:27.06	2026-07-07 13:07:27.06	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2814	2811	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:27.868	2026-07-07 13:07:27.868	Sec. 27 of NDPS Act
2815	2812	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:28.755	2026-07-07 13:07:28.755	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2816	2813	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:07:29.637	2026-07-07 13:07:29.637	Sec. 27 of NDPS Act
2817	2814	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:07:30.449	2026-07-07 13:07:30.449	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2818	2815	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:31.319	2026-07-07 13:07:31.319	Sec. 27 of NDPS Act
2819	2816	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:32.14	2026-07-07 13:07:32.14	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2820	2817	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:33.037	2026-07-07 13:07:33.037	Sec. 27 of NDPS Act
2821	2818	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:33.853	2026-07-07 13:07:33.853	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2822	2819	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:34.671	2026-07-07 13:07:34.671	Sec. 27 of NDPS Act
2823	2820	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:35.556	2026-07-07 13:07:35.556	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2824	2821	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:36.427	2026-07-07 13:07:36.427	Sec. 27 of NDPS Act
2825	2822	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:37.302	2026-07-07 13:07:37.302	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2826	2823	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:38.107	2026-07-07 13:07:38.107	Sec. 27 of NDPS Act
2827	2824	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:38.915	2026-07-07 13:07:38.915	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2828	2825	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:07:39.805	2026-07-07 13:07:39.805	Sec. 27 of NDPS Act
2829	2826	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:07:40.602	2026-07-07 13:07:40.602	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2830	2827	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:41.527	2026-07-07 13:07:41.527	Sec. 27 of NDPS Act
2831	2828	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:42.345	2026-07-07 13:07:42.345	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2832	2829	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:43.203	2026-07-07 13:07:43.203	Sec. 27 of NDPS Act
2833	2830	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:44.08	2026-07-07 13:07:44.08	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2834	2831	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:44.812	2026-07-07 13:07:44.812	Sec. 27 of NDPS Act
2835	2832	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:45.629	2026-07-07 13:07:45.629	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2836	2833	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:46.425	2026-07-07 13:07:46.425	Sec. 27 of NDPS Act
2837	2834	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:47.298	2026-07-07 13:07:47.298	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2838	2835	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:48.156	2026-07-07 13:07:48.156	Sec. 27 of NDPS Act
2839	2836	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:49.019	2026-07-07 13:07:49.019	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2840	2837	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:07:49.882	2026-07-07 13:07:49.882	Sec. 27 of NDPS Act
2841	2838	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:07:50.698	2026-07-07 13:07:50.698	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2842	2839	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:51.563	2026-07-07 13:07:51.563	Sec. 27 of NDPS Act
2843	2840	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:07:52.371	2026-07-07 13:07:52.371	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2844	2841	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:53.233	2026-07-07 13:07:53.233	Sec. 27 of NDPS Act
2845	2842	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:07:53.967	2026-07-07 13:07:53.967	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2846	2843	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:54.834	2026-07-07 13:07:54.834	Sec. 27 of NDPS Act
2847	2844	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:07:55.687	2026-07-07 13:07:55.687	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2848	2845	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:56.553	2026-07-07 13:07:56.553	Sec. 27 of NDPS Act
2849	2846	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:07:57.408	2026-07-07 13:07:57.408	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2850	2847	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:58.279	2026-07-07 13:07:58.279	Sec. 27 of NDPS Act
2851	2848	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:07:59.08	2026-07-07 13:07:59.08	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2852	2849	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:07:59.966	2026-07-07 13:07:59.966	Sec. 27 of NDPS Act
2853	2850	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:08:00.863	2026-07-07 13:08:00.863	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2854	2851	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:08:01.676	2026-07-07 13:08:01.676	Sec. 27 of NDPS Act
2855	2852	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:08:02.488	2026-07-07 13:08:02.488	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2856	2853	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:08:03.321	2026-07-07 13:08:03.321	Sec. 27 of NDPS Act
2857	2854	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:08:04.194	2026-07-07 13:08:04.194	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2858	2855	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:08:05.063	2026-07-07 13:08:05.063	Sec. 27 of NDPS Act
2859	2856	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:08:05.942	2026-07-07 13:08:05.942	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2860	2857	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:08:06.816	2026-07-07 13:08:06.816	Sec. 27 of NDPS Act
2861	2858	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:08:07.692	2026-07-07 13:08:07.692	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2862	2859	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:08:08.567	2026-07-07 13:08:08.567	Sec. 27 of NDPS Act
2863	2860	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:08:09.384	2026-07-07 13:08:09.384	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2864	2861	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:08:10.539	2026-07-07 13:08:10.539	Sec. 27 of NDPS Act
2865	2862	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:08:11.431	2026-07-07 13:08:11.431	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2866	2863	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:08:12.371	2026-07-07 13:08:12.371	Sec. 27 of NDPS Act
2867	2864	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:08:13.237	2026-07-07 13:08:13.237	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2868	2865	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:08:14.081	2026-07-07 13:08:14.081	Sec. 27 of NDPS Act
2869	2866	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:08:14.967	2026-07-07 13:08:14.967	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2870	2867	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:08:15.769	2026-07-07 13:08:15.769	Sec. 27 of NDPS Act
2871	2868	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:08:16.58	2026-07-07 13:08:16.58	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2872	2869	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:08:17.401	2026-07-07 13:08:17.401	Sec. 27 of NDPS Act
2873	2870	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:08:18.284	2026-07-07 13:08:18.284	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2874	2871	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:08:19.096	2026-07-07 13:08:19.096	Sec. 27 of NDPS Act
2875	2872	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:08:20.042	2026-07-07 13:08:20.042	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2876	2873	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:08:20.919	2026-07-07 13:08:20.919	Sec. 27 of NDPS Act
2877	2874	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:08:21.733	2026-07-07 13:08:21.733	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2878	2875	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:08:22.611	2026-07-07 13:08:22.611	Sec. 27 of NDPS Act
2879	2876	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Abandoned building	2026-07-07 13:08:23.49	2026-07-07 13:08:23.49	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2880	2877	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:08:24.286	2026-07-07 13:08:24.286	Sec. 27 of NDPS Act
2881	2878	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:08:25.153	2026-07-07 13:08:25.153	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2882	2879	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:08:26.041	2026-07-07 13:08:26.041	Sec. 27 of NDPS Act
2892	2889	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:08:34.655	2026-07-07 13:08:34.655	Sec. 27 of NDPS Act
2893	2890	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Under the bridge	2026-07-07 13:08:35.535	2026-07-07 13:08:35.535	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2894	2891	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:08:36.416	2026-07-07 13:08:36.416	Sec. 27 of NDPS Act
2895	2892	GANJA_ONLY	DAILY	LOCAL	UPI	Abandoned building	2026-07-07 13:08:37.249	2026-07-07 13:08:37.249	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2896	2893	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:08:38.122	2026-07-07 13:08:38.122	Sec. 27 of NDPS Act
2897	2894	GANJA_ALCOHOL	WEEKLY	ONLINE	CASH	Under the bridge	2026-07-07 13:08:39.009	2026-07-07 13:08:39.009	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2898	2895	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:08:39.9	2026-07-07 13:08:39.9	Sec. 27 of NDPS Act
2899	2896	GANJA_OTHER_DRUGS	OCCASIONAL	OUTSIDE_DISTRICT	CREDIT	Abandoned building	2026-07-07 13:08:40.703	2026-07-07 13:08:40.703	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
2900	2897	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:08:41.508	2026-07-07 13:08:41.508	Sec. 27 of NDPS Act
2901	2898	GANJA_ONLY	DAILY	LOCAL	UPI	Under the bridge	2026-07-07 13:08:42.402	2026-07-07 13:08:42.402	Sec. 8(c) r/w 20(b)(ii)(B) of NDPS Act
\.


--
-- Data for Name: offender_financials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offender_financials (id, offender_id, fin_type, value, bank_name, notes, created_at) FROM stdin;
2237	2771	UPI_ID	rameshbabu00@upi	SBI	UPI payment ID	2026-07-07 13:06:52.794
2238	2771	BANK_ACCOUNT_NO	308945672100	SBI	Savings account	2026-07-07 13:06:52.794
2239	2772	UPI_ID	sureshprasad01@upi	SBI	UPI payment ID	2026-07-07 13:06:54.126
2240	2772	BANK_ACCOUNT_NO	308945672101	SBI	Savings account	2026-07-07 13:06:54.126
2241	2773	UPI_ID	manojreddy10@upi	HDFC	UPI payment ID	2026-07-07 13:06:55.059
2242	2773	BANK_ACCOUNT_NO	308945672102	HDFC	Savings account	2026-07-07 13:06:55.059
2243	2774	UPI_ID	venkatsingh11@upi	HDFC	UPI payment ID	2026-07-07 13:06:55.967
2244	2774	BANK_ACCOUNT_NO	308945672103	HDFC	Savings account	2026-07-07 13:06:55.967
2245	2775	UPI_ID	rajeshachari20@upi	ICICI Bank	UPI payment ID	2026-07-07 13:06:56.832
2246	2775	BANK_ACCOUNT_NO	308945672104	ICICI Bank	Savings account	2026-07-07 13:06:56.832
2247	2776	UPI_ID	prakashvarma21@upi	ICICI Bank	UPI payment ID	2026-07-07 13:06:57.713
2248	2776	BANK_ACCOUNT_NO	308945672105	ICICI Bank	Savings account	2026-07-07 13:06:57.713
2249	2777	UPI_ID	anilchakravarthy30@upi	SBI	UPI payment ID	2026-07-07 13:06:58.585
2250	2777	BANK_ACCOUNT_NO	308945672106	SBI	Savings account	2026-07-07 13:06:58.585
2251	2778	UPI_ID	srinivaspatnaik31@upi	SBI	UPI payment ID	2026-07-07 13:06:59.518
2252	2778	BANK_ACCOUNT_NO	308945672107	SBI	Savings account	2026-07-07 13:06:59.518
2253	2779	UPI_ID	bhaskarmurthy40@upi	HDFC	UPI payment ID	2026-07-07 13:07:00.333
2254	2779	BANK_ACCOUNT_NO	308945672108	HDFC	Savings account	2026-07-07 13:07:00.333
2255	2780	UPI_ID	naveenshekar41@upi	HDFC	UPI payment ID	2026-07-07 13:07:01.136
2256	2780	BANK_ACCOUNT_NO	308945672109	HDFC	Savings account	2026-07-07 13:07:01.136
2257	2781	UPI_ID	ganeshnayak50@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:02.053
2258	2781	BANK_ACCOUNT_NO	308945672110	ICICI Bank	Savings account	2026-07-07 13:07:02.053
2259	2782	UPI_ID	vijaybabu51@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:02.932
2260	2782	BANK_ACCOUNT_NO	308945672111	ICICI Bank	Savings account	2026-07-07 13:07:02.932
2261	2783	UPI_ID	sivaswamy60@upi	SBI	UPI payment ID	2026-07-07 13:07:03.818
2262	2783	BANK_ACCOUNT_NO	308945672112	SBI	Savings account	2026-07-07 13:07:03.818
2263	2784	UPI_ID	harireddy61@upi	SBI	UPI payment ID	2026-07-07 13:07:04.695
2264	2784	BANK_ACCOUNT_NO	308945672113	SBI	Savings account	2026-07-07 13:07:04.695
2265	2785	UPI_ID	nagarajupratap70@upi	HDFC	UPI payment ID	2026-07-07 13:07:05.575
2266	2785	BANK_ACCOUNT_NO	308945672114	HDFC	Savings account	2026-07-07 13:07:05.575
2267	2786	UPI_ID	prasadachari71@upi	HDFC	UPI payment ID	2026-07-07 13:07:06.458
2268	2786	BANK_ACCOUNT_NO	308945672115	HDFC	Savings account	2026-07-07 13:07:06.458
2269	2787	UPI_ID	chandragowd80@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:07.27
2270	2787	BANK_ACCOUNT_NO	308945672116	ICICI Bank	Savings account	2026-07-07 13:07:07.27
2271	2788	UPI_ID	madhavachakravarthy81@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:08.069
2272	2788	BANK_ACCOUNT_NO	308945672117	ICICI Bank	Savings account	2026-07-07 13:07:08.069
2273	2789	UPI_ID	ravindrarao90@upi	SBI	UPI payment ID	2026-07-07 13:07:08.944
2274	2789	BANK_ACCOUNT_NO	308945672118	SBI	Savings account	2026-07-07 13:07:08.944
2275	2790	UPI_ID	kalyanmurthy91@upi	SBI	UPI payment ID	2026-07-07 13:07:09.83
2276	2790	BANK_ACCOUNT_NO	308945672119	SBI	Savings account	2026-07-07 13:07:09.83
2277	2791	UPI_ID	sudhakarshankar100@upi	HDFC	UPI payment ID	2026-07-07 13:07:10.774
2278	2791	BANK_ACCOUNT_NO	308945672120	HDFC	Savings account	2026-07-07 13:07:10.774
2279	2792	UPI_ID	narendranayak101@upi	HDFC	UPI payment ID	2026-07-07 13:07:11.579
2280	2792	BANK_ACCOUNT_NO	308945672121	HDFC	Savings account	2026-07-07 13:07:11.579
2281	2793	UPI_ID	mohansastry110@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:12.394
2282	2793	BANK_ACCOUNT_NO	308945672122	ICICI Bank	Savings account	2026-07-07 13:07:12.394
2283	2794	UPI_ID	jayaswamy111@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:13.267
2284	2794	BANK_ACCOUNT_NO	308945672123	ICICI Bank	Savings account	2026-07-07 13:07:13.267
2285	2795	UPI_ID	gangadharraju120@upi	SBI	UPI payment ID	2026-07-07 13:07:14.144
2286	2795	BANK_ACCOUNT_NO	308945672124	SBI	Savings account	2026-07-07 13:07:14.144
2287	2796	UPI_ID	balajipratap121@upi	SBI	UPI payment ID	2026-07-07 13:07:15.021
2288	2796	BANK_ACCOUNT_NO	308945672125	SBI	Savings account	2026-07-07 13:07:15.021
2315	2810	UPI_ID	raviteja191@upi	HDFC	UPI payment ID	2026-07-07 13:07:27.06
2316	2810	BANK_ACCOUNT_NO	308945672139	HDFC	Savings account	2026-07-07 13:07:27.06
2317	2811	UPI_ID	kotipatnaik200@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:27.868
2318	2811	BANK_ACCOUNT_NO	308945672140	ICICI Bank	Savings account	2026-07-07 13:07:27.868
2319	2812	UPI_ID	vamsikumar201@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:28.755
2320	2812	BANK_ACCOUNT_NO	308945672141	ICICI Bank	Savings account	2026-07-07 13:07:28.755
2321	2813	UPI_ID	apparaoshekar210@upi	SBI	UPI payment ID	2026-07-07 13:07:29.637
2322	2813	BANK_ACCOUNT_NO	308945672142	SBI	Savings account	2026-07-07 13:07:29.637
2323	2814	UPI_ID	kondanaidu211@upi	SBI	UPI payment ID	2026-07-07 13:07:30.449
2324	2814	BANK_ACCOUNT_NO	308945672143	SBI	Savings account	2026-07-07 13:07:30.449
2325	2815	UPI_ID	chaitubabu220@upi	HDFC	UPI payment ID	2026-07-07 13:07:31.319
2326	2815	BANK_ACCOUNT_NO	308945672144	HDFC	Savings account	2026-07-07 13:07:31.319
2327	2816	UPI_ID	babjiprasad221@upi	HDFC	UPI payment ID	2026-07-07 13:07:32.14
2328	2816	BANK_ACCOUNT_NO	308945672145	HDFC	Savings account	2026-07-07 13:07:32.14
2329	2817	UPI_ID	rameshreddy230@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:33.037
2330	2817	BANK_ACCOUNT_NO	308945672146	ICICI Bank	Savings account	2026-07-07 13:07:33.037
2331	2818	UPI_ID	sureshsingh231@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:33.853
2332	2818	BANK_ACCOUNT_NO	308945672147	ICICI Bank	Savings account	2026-07-07 13:07:33.853
2333	2819	UPI_ID	manojachari240@upi	SBI	UPI payment ID	2026-07-07 13:07:34.671
2334	2819	BANK_ACCOUNT_NO	308945672148	SBI	Savings account	2026-07-07 13:07:34.671
2335	2820	UPI_ID	venkatvarma241@upi	SBI	UPI payment ID	2026-07-07 13:07:35.556
2336	2820	BANK_ACCOUNT_NO	308945672149	SBI	Savings account	2026-07-07 13:07:35.556
2337	2821	UPI_ID	rajeshchakravarthy250@upi	HDFC	UPI payment ID	2026-07-07 13:07:36.427
2338	2821	BANK_ACCOUNT_NO	308945672150	HDFC	Savings account	2026-07-07 13:07:36.427
2339	2822	UPI_ID	prakashpatnaik251@upi	HDFC	UPI payment ID	2026-07-07 13:07:37.302
2340	2822	BANK_ACCOUNT_NO	308945672151	HDFC	Savings account	2026-07-07 13:07:37.302
2341	2823	UPI_ID	anilmurthy260@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:38.107
2342	2823	BANK_ACCOUNT_NO	308945672152	ICICI Bank	Savings account	2026-07-07 13:07:38.107
2343	2824	UPI_ID	srinivasshekar261@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:38.915
2344	2824	BANK_ACCOUNT_NO	308945672153	ICICI Bank	Savings account	2026-07-07 13:07:38.915
2345	2825	UPI_ID	bhaskarnayak270@upi	SBI	UPI payment ID	2026-07-07 13:07:39.805
2346	2825	BANK_ACCOUNT_NO	308945672154	SBI	Savings account	2026-07-07 13:07:39.805
2347	2826	UPI_ID	naveenbabu271@upi	SBI	UPI payment ID	2026-07-07 13:07:40.602
2348	2826	BANK_ACCOUNT_NO	308945672155	SBI	Savings account	2026-07-07 13:07:40.602
2349	2827	UPI_ID	ganeshswamy280@upi	HDFC	UPI payment ID	2026-07-07 13:07:41.527
2350	2827	BANK_ACCOUNT_NO	308945672156	HDFC	Savings account	2026-07-07 13:07:41.527
2351	2828	UPI_ID	vijayreddy281@upi	HDFC	UPI payment ID	2026-07-07 13:07:42.345
2352	2828	BANK_ACCOUNT_NO	308945672157	HDFC	Savings account	2026-07-07 13:07:42.345
2353	2829	UPI_ID	sivapratap290@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:43.203
2354	2829	BANK_ACCOUNT_NO	308945672158	ICICI Bank	Savings account	2026-07-07 13:07:43.203
2355	2830	UPI_ID	hariachari291@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:44.08
2356	2830	BANK_ACCOUNT_NO	308945672159	ICICI Bank	Savings account	2026-07-07 13:07:44.08
2357	2831	UPI_ID	nagarajugowd300@upi	SBI	UPI payment ID	2026-07-07 13:07:44.812
2358	2831	BANK_ACCOUNT_NO	308945672160	SBI	Savings account	2026-07-07 13:07:44.812
2359	2832	UPI_ID	prasadchakravarthy301@upi	SBI	UPI payment ID	2026-07-07 13:07:45.629
2360	2832	BANK_ACCOUNT_NO	308945672161	SBI	Savings account	2026-07-07 13:07:45.629
2361	2833	UPI_ID	chandrarao310@upi	HDFC	UPI payment ID	2026-07-07 13:07:46.425
2362	2833	BANK_ACCOUNT_NO	308945672162	HDFC	Savings account	2026-07-07 13:07:46.425
2363	2834	UPI_ID	madhavamurthy311@upi	HDFC	UPI payment ID	2026-07-07 13:07:47.298
2289	2797	UPI_ID	subramanyamchoudhary130@upi	HDFC	UPI payment ID	2026-07-07 13:07:15.902
2290	2797	BANK_ACCOUNT_NO	308945672126	HDFC	Savings account	2026-07-07 13:07:15.902
2291	2798	UPI_ID	lokeshgowd131@upi	HDFC	UPI payment ID	2026-07-07 13:07:16.723
2292	2798	BANK_ACCOUNT_NO	308945672127	HDFC	Savings account	2026-07-07 13:07:16.723
2293	2799	UPI_ID	nareshteja140@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:17.546
2294	2799	BANK_ACCOUNT_NO	308945672128	ICICI Bank	Savings account	2026-07-07 13:07:17.546
2295	2800	UPI_ID	ramanarao141@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:18.348
2296	2800	BANK_ACCOUNT_NO	308945672129	ICICI Bank	Savings account	2026-07-07 13:07:18.348
2297	2801	UPI_ID	krishnakumar150@upi	SBI	UPI payment ID	2026-07-07 13:07:19.25
2298	2801	BANK_ACCOUNT_NO	308945672130	SBI	Savings account	2026-07-07 13:07:19.25
2299	2802	UPI_ID	anandshankar151@upi	SBI	UPI payment ID	2026-07-07 13:07:20.074
2300	2802	BANK_ACCOUNT_NO	308945672131	SBI	Savings account	2026-07-07 13:07:20.074
2301	2803	UPI_ID	maheshnaidu160@upi	HDFC	UPI payment ID	2026-07-07 13:07:20.883
2302	2803	BANK_ACCOUNT_NO	308945672132	HDFC	Savings account	2026-07-07 13:07:20.883
2303	2804	UPI_ID	kiransastry161@upi	HDFC	UPI payment ID	2026-07-07 13:07:21.697
2304	2804	BANK_ACCOUNT_NO	308945672133	HDFC	Savings account	2026-07-07 13:07:21.697
2305	2805	UPI_ID	satishprasad170@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:22.58
2306	2805	BANK_ACCOUNT_NO	308945672134	ICICI Bank	Savings account	2026-07-07 13:07:22.58
2307	2806	UPI_ID	rajuraju171@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:23.472
2308	2806	BANK_ACCOUNT_NO	308945672135	ICICI Bank	Savings account	2026-07-07 13:07:23.472
2309	2807	UPI_ID	gopalsingh180@upi	SBI	UPI payment ID	2026-07-07 13:07:24.345
2310	2807	BANK_ACCOUNT_NO	308945672136	SBI	Savings account	2026-07-07 13:07:24.345
2311	2808	UPI_ID	sekharchoudhary181@upi	SBI	UPI payment ID	2026-07-07 13:07:25.24
2312	2808	BANK_ACCOUNT_NO	308945672137	SBI	Savings account	2026-07-07 13:07:25.24
2313	2809	UPI_ID	pavanvarma190@upi	HDFC	UPI payment ID	2026-07-07 13:07:26.18
2314	2809	BANK_ACCOUNT_NO	308945672138	HDFC	Savings account	2026-07-07 13:07:26.18
2364	2834	BANK_ACCOUNT_NO	308945672163	HDFC	Savings account	2026-07-07 13:07:47.298
2365	2835	UPI_ID	ravindrashankar320@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:48.156
2366	2835	BANK_ACCOUNT_NO	308945672164	ICICI Bank	Savings account	2026-07-07 13:07:48.156
2367	2836	UPI_ID	kalyannayak321@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:49.019
2368	2836	BANK_ACCOUNT_NO	308945672165	ICICI Bank	Savings account	2026-07-07 13:07:49.019
2369	2837	UPI_ID	sudhakarsastry330@upi	SBI	UPI payment ID	2026-07-07 13:07:49.882
2370	2837	BANK_ACCOUNT_NO	308945672166	SBI	Savings account	2026-07-07 13:07:49.882
2371	2838	UPI_ID	narendraswamy331@upi	SBI	UPI payment ID	2026-07-07 13:07:50.698
2372	2838	BANK_ACCOUNT_NO	308945672167	SBI	Savings account	2026-07-07 13:07:50.698
2373	2839	UPI_ID	mohanraju340@upi	HDFC	UPI payment ID	2026-07-07 13:07:51.563
2374	2839	BANK_ACCOUNT_NO	308945672168	HDFC	Savings account	2026-07-07 13:07:51.563
2375	2840	UPI_ID	jayapratap341@upi	HDFC	UPI payment ID	2026-07-07 13:07:52.371
2376	2840	BANK_ACCOUNT_NO	308945672169	HDFC	Savings account	2026-07-07 13:07:52.371
2377	2841	UPI_ID	gangadharchoudhary350@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:53.233
2378	2841	BANK_ACCOUNT_NO	308945672170	ICICI Bank	Savings account	2026-07-07 13:07:53.233
2379	2842	UPI_ID	balajigowd351@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:53.967
2380	2842	BANK_ACCOUNT_NO	308945672171	ICICI Bank	Savings account	2026-07-07 13:07:53.967
2381	2843	UPI_ID	subramanyamteja360@upi	SBI	UPI payment ID	2026-07-07 13:07:54.834
2382	2843	BANK_ACCOUNT_NO	308945672172	SBI	Savings account	2026-07-07 13:07:54.834
2383	2844	UPI_ID	lokeshrao361@upi	SBI	UPI payment ID	2026-07-07 13:07:55.687
2384	2844	BANK_ACCOUNT_NO	308945672173	SBI	Savings account	2026-07-07 13:07:55.687
2385	2845	UPI_ID	nareshkumar370@upi	HDFC	UPI payment ID	2026-07-07 13:07:56.553
2386	2845	BANK_ACCOUNT_NO	308945672174	HDFC	Savings account	2026-07-07 13:07:56.553
2387	2846	UPI_ID	ramanashankar371@upi	HDFC	UPI payment ID	2026-07-07 13:07:57.408
2388	2846	BANK_ACCOUNT_NO	308945672175	HDFC	Savings account	2026-07-07 13:07:57.408
2389	2847	UPI_ID	krishnanaidu380@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:58.279
2390	2847	BANK_ACCOUNT_NO	308945672176	ICICI Bank	Savings account	2026-07-07 13:07:58.279
2391	2848	UPI_ID	anandsastry381@upi	ICICI Bank	UPI payment ID	2026-07-07 13:07:59.08
2392	2848	BANK_ACCOUNT_NO	308945672177	ICICI Bank	Savings account	2026-07-07 13:07:59.08
2393	2849	UPI_ID	maheshprasad390@upi	SBI	UPI payment ID	2026-07-07 13:07:59.966
2394	2849	BANK_ACCOUNT_NO	308945672178	SBI	Savings account	2026-07-07 13:07:59.966
2395	2850	UPI_ID	kiranraju391@upi	SBI	UPI payment ID	2026-07-07 13:08:00.863
2396	2850	BANK_ACCOUNT_NO	308945672179	SBI	Savings account	2026-07-07 13:08:00.863
2397	2851	UPI_ID	satishsingh400@upi	HDFC	UPI payment ID	2026-07-07 13:08:01.676
2398	2851	BANK_ACCOUNT_NO	308945672180	HDFC	Savings account	2026-07-07 13:08:01.676
2399	2852	UPI_ID	rajuchoudhary401@upi	HDFC	UPI payment ID	2026-07-07 13:08:02.488
2400	2852	BANK_ACCOUNT_NO	308945672181	HDFC	Savings account	2026-07-07 13:08:02.488
2401	2853	UPI_ID	gopalvarma410@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:03.321
2402	2853	BANK_ACCOUNT_NO	308945672182	ICICI Bank	Savings account	2026-07-07 13:08:03.321
2403	2854	UPI_ID	sekharteja411@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:04.194
2404	2854	BANK_ACCOUNT_NO	308945672183	ICICI Bank	Savings account	2026-07-07 13:08:04.194
2405	2855	UPI_ID	pavanpatnaik420@upi	SBI	UPI payment ID	2026-07-07 13:08:05.063
2406	2855	BANK_ACCOUNT_NO	308945672184	SBI	Savings account	2026-07-07 13:08:05.063
2407	2856	UPI_ID	ravikumar421@upi	SBI	UPI payment ID	2026-07-07 13:08:05.942
2408	2856	BANK_ACCOUNT_NO	308945672185	SBI	Savings account	2026-07-07 13:08:05.942
2409	2857	UPI_ID	kotishekar430@upi	HDFC	UPI payment ID	2026-07-07 13:08:06.816
2410	2857	BANK_ACCOUNT_NO	308945672186	HDFC	Savings account	2026-07-07 13:08:06.816
2411	2858	UPI_ID	vamsinaidu431@upi	HDFC	UPI payment ID	2026-07-07 13:08:07.692
2412	2858	BANK_ACCOUNT_NO	308945672187	HDFC	Savings account	2026-07-07 13:08:07.692
2413	2859	UPI_ID	apparaobabu440@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:08.567
2414	2859	BANK_ACCOUNT_NO	308945672188	ICICI Bank	Savings account	2026-07-07 13:08:08.567
2415	2860	UPI_ID	kondaprasad441@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:09.384
2416	2860	BANK_ACCOUNT_NO	308945672189	ICICI Bank	Savings account	2026-07-07 13:08:09.384
2417	2861	UPI_ID	chaitureddy450@upi	SBI	UPI payment ID	2026-07-07 13:08:10.539
2418	2861	BANK_ACCOUNT_NO	308945672190	SBI	Savings account	2026-07-07 13:08:10.539
2419	2862	UPI_ID	babjisingh451@upi	SBI	UPI payment ID	2026-07-07 13:08:11.431
2420	2862	BANK_ACCOUNT_NO	308945672191	SBI	Savings account	2026-07-07 13:08:11.431
2421	2863	UPI_ID	rameshachari460@upi	HDFC	UPI payment ID	2026-07-07 13:08:12.371
2422	2863	BANK_ACCOUNT_NO	308945672192	HDFC	Savings account	2026-07-07 13:08:12.371
2423	2864	UPI_ID	sureshvarma461@upi	HDFC	UPI payment ID	2026-07-07 13:08:13.237
2424	2864	BANK_ACCOUNT_NO	308945672193	HDFC	Savings account	2026-07-07 13:08:13.237
2425	2865	UPI_ID	manojchakravarthy470@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:14.081
2426	2865	BANK_ACCOUNT_NO	308945672194	ICICI Bank	Savings account	2026-07-07 13:08:14.081
2427	2866	UPI_ID	venkatpatnaik471@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:14.967
2428	2866	BANK_ACCOUNT_NO	308945672195	ICICI Bank	Savings account	2026-07-07 13:08:14.967
2429	2867	UPI_ID	rajeshmurthy480@upi	SBI	UPI payment ID	2026-07-07 13:08:15.769
2430	2867	BANK_ACCOUNT_NO	308945672196	SBI	Savings account	2026-07-07 13:08:15.769
2431	2868	UPI_ID	prakashshekar481@upi	SBI	UPI payment ID	2026-07-07 13:08:16.58
2432	2868	BANK_ACCOUNT_NO	308945672197	SBI	Savings account	2026-07-07 13:08:16.58
2433	2869	UPI_ID	anilnayak490@upi	HDFC	UPI payment ID	2026-07-07 13:08:17.401
2434	2869	BANK_ACCOUNT_NO	308945672198	HDFC	Savings account	2026-07-07 13:08:17.401
2435	2870	UPI_ID	srinivasbabu491@upi	HDFC	UPI payment ID	2026-07-07 13:08:18.284
2436	2870	BANK_ACCOUNT_NO	308945672199	HDFC	Savings account	2026-07-07 13:08:18.284
2437	2871	UPI_ID	bhaskarswamy500@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:19.096
2438	2871	BANK_ACCOUNT_NO	308945672200	ICICI Bank	Savings account	2026-07-07 13:08:19.096
2439	2872	UPI_ID	naveenreddy501@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:20.042
2440	2872	BANK_ACCOUNT_NO	308945672201	ICICI Bank	Savings account	2026-07-07 13:08:20.042
2441	2873	UPI_ID	ganeshpratap510@upi	SBI	UPI payment ID	2026-07-07 13:08:20.919
2442	2873	BANK_ACCOUNT_NO	308945672202	SBI	Savings account	2026-07-07 13:08:20.919
2443	2874	UPI_ID	vijayachari511@upi	SBI	UPI payment ID	2026-07-07 13:08:21.733
2444	2874	BANK_ACCOUNT_NO	308945672203	SBI	Savings account	2026-07-07 13:08:21.733
2445	2875	UPI_ID	sivagowd520@upi	HDFC	UPI payment ID	2026-07-07 13:08:22.611
2446	2875	BANK_ACCOUNT_NO	308945672204	HDFC	Savings account	2026-07-07 13:08:22.611
2447	2876	UPI_ID	harichakravarthy521@upi	HDFC	UPI payment ID	2026-07-07 13:08:23.49
2448	2876	BANK_ACCOUNT_NO	308945672205	HDFC	Savings account	2026-07-07 13:08:23.49
2449	2877	UPI_ID	nagarajurao530@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:24.286
2450	2877	BANK_ACCOUNT_NO	308945672206	ICICI Bank	Savings account	2026-07-07 13:08:24.286
2451	2878	UPI_ID	prasadmurthy531@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:25.153
2452	2878	BANK_ACCOUNT_NO	308945672207	ICICI Bank	Savings account	2026-07-07 13:08:25.153
2453	2879	UPI_ID	chandrashankar540@upi	SBI	UPI payment ID	2026-07-07 13:08:26.041
2454	2879	BANK_ACCOUNT_NO	308945672208	SBI	Savings account	2026-07-07 13:08:26.041
2455	2880	UPI_ID	madhavanayak541@upi	SBI	UPI payment ID	2026-07-07 13:08:26.892
2456	2880	BANK_ACCOUNT_NO	308945672209	SBI	Savings account	2026-07-07 13:08:26.892
2457	2881	UPI_ID	ravindrasastry550@upi	HDFC	UPI payment ID	2026-07-07 13:08:27.707
2458	2881	BANK_ACCOUNT_NO	308945672210	HDFC	Savings account	2026-07-07 13:08:27.707
2459	2882	UPI_ID	kalyanswamy551@upi	HDFC	UPI payment ID	2026-07-07 13:08:28.594
2460	2882	BANK_ACCOUNT_NO	308945672211	HDFC	Savings account	2026-07-07 13:08:28.594
2461	2883	UPI_ID	sudhakarraju560@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:29.341
2462	2883	BANK_ACCOUNT_NO	308945672212	ICICI Bank	Savings account	2026-07-07 13:08:29.341
2463	2884	UPI_ID	narendrapratap561@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:30.23
2464	2884	BANK_ACCOUNT_NO	308945672213	ICICI Bank	Savings account	2026-07-07 13:08:30.23
2465	2885	UPI_ID	mohanchoudhary570@upi	SBI	UPI payment ID	2026-07-07 13:08:31.123
2466	2885	BANK_ACCOUNT_NO	308945672214	SBI	Savings account	2026-07-07 13:08:31.123
2467	2886	UPI_ID	jayagowd571@upi	SBI	UPI payment ID	2026-07-07 13:08:31.941
2468	2886	BANK_ACCOUNT_NO	308945672215	SBI	Savings account	2026-07-07 13:08:31.941
2469	2887	UPI_ID	gangadharteja580@upi	HDFC	UPI payment ID	2026-07-07 13:08:32.82
2470	2887	BANK_ACCOUNT_NO	308945672216	HDFC	Savings account	2026-07-07 13:08:32.82
2471	2888	UPI_ID	balajirao581@upi	HDFC	UPI payment ID	2026-07-07 13:08:33.709
2472	2888	BANK_ACCOUNT_NO	308945672217	HDFC	Savings account	2026-07-07 13:08:33.709
2473	2889	UPI_ID	subramanyamkumar590@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:34.655
2474	2889	BANK_ACCOUNT_NO	308945672218	ICICI Bank	Savings account	2026-07-07 13:08:34.655
2475	2890	UPI_ID	lokeshshankar591@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:35.535
2476	2890	BANK_ACCOUNT_NO	308945672219	ICICI Bank	Savings account	2026-07-07 13:08:35.535
2477	2891	UPI_ID	nareshnaidu600@upi	SBI	UPI payment ID	2026-07-07 13:08:36.416
2478	2891	BANK_ACCOUNT_NO	308945672220	SBI	Savings account	2026-07-07 13:08:36.416
2479	2892	UPI_ID	ramanasastry601@upi	SBI	UPI payment ID	2026-07-07 13:08:37.249
2480	2892	BANK_ACCOUNT_NO	308945672221	SBI	Savings account	2026-07-07 13:08:37.249
2481	2893	UPI_ID	krishnaprasad610@upi	HDFC	UPI payment ID	2026-07-07 13:08:38.122
2482	2893	BANK_ACCOUNT_NO	308945672222	HDFC	Savings account	2026-07-07 13:08:38.122
2483	2894	UPI_ID	anandraju611@upi	HDFC	UPI payment ID	2026-07-07 13:08:39.009
2484	2894	BANK_ACCOUNT_NO	308945672223	HDFC	Savings account	2026-07-07 13:08:39.009
2485	2895	UPI_ID	maheshsingh620@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:39.9
2486	2895	BANK_ACCOUNT_NO	308945672224	ICICI Bank	Savings account	2026-07-07 13:08:39.9
2487	2896	UPI_ID	kiranchoudhary621@upi	ICICI Bank	UPI payment ID	2026-07-07 13:08:40.703
2488	2896	BANK_ACCOUNT_NO	308945672225	ICICI Bank	Savings account	2026-07-07 13:08:40.703
2489	2897	UPI_ID	satishvarma630@upi	SBI	UPI payment ID	2026-07-07 13:08:41.508
2490	2897	BANK_ACCOUNT_NO	308945672226	SBI	Savings account	2026-07-07 13:08:41.508
2491	2898	UPI_ID	rajuteja631@upi	SBI	UPI payment ID	2026-07-07 13:08:42.402
2492	2898	BANK_ACCOUNT_NO	308945672227	SBI	Savings account	2026-07-07 13:08:42.402
\.


--
-- Data for Name: offender_identity_docs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offender_identity_docs (id, offender_id, aadhaar_no, voter_id, pan_card, created_at) FROM stdin;
1122	2771	453287100000	AP320810000	ABCDE1000F	2026-07-07 13:06:52.794
1123	2772	453287100043	AP320810019	ABCDE1007F	2026-07-07 13:06:54.126
1124	2773	453287100097	AP320810037	ABCDE1013F	2026-07-07 13:06:55.059
1125	2774	453287100140	AP320810056	ABCDE1020F	2026-07-07 13:06:55.967
1126	2775	453287100194	AP320810074	ABCDE1026F	2026-07-07 13:06:56.832
1127	2776	453287100237	AP320810093	ABCDE1033F	2026-07-07 13:06:57.713
1128	2777	453287100291	AP320810111	ABCDE1039F	2026-07-07 13:06:58.585
1129	2778	453287100334	AP320810130	ABCDE1046F	2026-07-07 13:06:59.518
1130	2779	453287100388	AP320810148	ABCDE1052F	2026-07-07 13:07:00.333
1131	2780	453287100431	AP320810167	ABCDE1059F	2026-07-07 13:07:01.136
1132	2781	453287100485	AP320810185	ABCDE1065F	2026-07-07 13:07:02.053
1133	2782	453287100528	AP320810204	ABCDE1072F	2026-07-07 13:07:02.932
1134	2783	453287100582	AP320810222	ABCDE1078F	2026-07-07 13:07:03.818
1135	2784	453287100625	AP320810241	ABCDE1085F	2026-07-07 13:07:04.695
1136	2785	453287100679	AP320810259	ABCDE1091F	2026-07-07 13:07:05.575
1137	2786	453287100722	AP320810278	ABCDE1098F	2026-07-07 13:07:06.458
1138	2787	453287100776	AP320810296	ABCDE1104F	2026-07-07 13:07:07.27
1139	2788	453287100819	AP320810315	ABCDE1111F	2026-07-07 13:07:08.069
1140	2789	453287100873	AP320810333	ABCDE1117F	2026-07-07 13:07:08.944
1141	2790	453287100916	AP320810352	ABCDE1124F	2026-07-07 13:07:09.83
1142	2791	453287100970	AP320810370	ABCDE1130F	2026-07-07 13:07:10.774
1143	2792	453287101013	AP320810389	ABCDE1137F	2026-07-07 13:07:11.579
1144	2793	453287101067	AP320810407	ABCDE1143F	2026-07-07 13:07:12.394
1145	2794	453287101110	AP320810426	ABCDE1150F	2026-07-07 13:07:13.267
1146	2795	453287101164	AP320810444	ABCDE1156F	2026-07-07 13:07:14.144
1147	2796	453287101207	AP320810463	ABCDE1163F	2026-07-07 13:07:15.021
1148	2797	453287101261	AP320810481	ABCDE1169F	2026-07-07 13:07:15.902
1149	2798	453287101304	AP320810500	ABCDE1176F	2026-07-07 13:07:16.723
1150	2799	453287101358	AP320810518	ABCDE1182F	2026-07-07 13:07:17.546
1151	2800	453287101401	AP320810537	ABCDE1189F	2026-07-07 13:07:18.348
1152	2801	453287101455	AP320810555	ABCDE1195F	2026-07-07 13:07:19.25
1153	2802	453287101498	AP320810574	ABCDE1202F	2026-07-07 13:07:20.074
1154	2803	453287101552	AP320810592	ABCDE1208F	2026-07-07 13:07:20.883
1155	2804	453287101595	AP320810611	ABCDE1215F	2026-07-07 13:07:21.697
1156	2805	453287101649	AP320810629	ABCDE1221F	2026-07-07 13:07:22.58
1157	2806	453287101692	AP320810648	ABCDE1228F	2026-07-07 13:07:23.472
1158	2807	453287101746	AP320810666	ABCDE1234F	2026-07-07 13:07:24.345
1159	2808	453287101789	AP320810685	ABCDE1241F	2026-07-07 13:07:25.24
1160	2809	453287101843	AP320810703	ABCDE1247F	2026-07-07 13:07:26.18
1217	2866	453287104602	AP320811758	ABCDE1618F	2026-07-07 13:08:14.967
1218	2867	453287104656	AP320811776	ABCDE1624F	2026-07-07 13:08:15.769
1219	2868	453287104699	AP320811795	ABCDE1631F	2026-07-07 13:08:16.58
1220	2869	453287104753	AP320811813	ABCDE1637F	2026-07-07 13:08:17.401
1221	2870	453287104796	AP320811832	ABCDE1644F	2026-07-07 13:08:18.284
1222	2871	453287104850	AP320811850	ABCDE1650F	2026-07-07 13:08:19.096
1223	2872	453287104893	AP320811869	ABCDE1657F	2026-07-07 13:08:20.042
1224	2873	453287104947	AP320811887	ABCDE1663F	2026-07-07 13:08:20.919
1225	2874	453287104990	AP320811906	ABCDE1670F	2026-07-07 13:08:21.733
1226	2875	453287105044	AP320811924	ABCDE1676F	2026-07-07 13:08:22.611
1227	2876	453287105087	AP320811943	ABCDE1683F	2026-07-07 13:08:23.49
1228	2877	453287105141	AP320811961	ABCDE1689F	2026-07-07 13:08:24.286
1229	2878	453287105184	AP320811980	ABCDE1696F	2026-07-07 13:08:25.153
1230	2879	453287105238	AP320811998	ABCDE1702F	2026-07-07 13:08:26.041
1231	2880	453287105281	AP320812017	ABCDE1709F	2026-07-07 13:08:26.892
1232	2881	453287105335	AP320812035	ABCDE1715F	2026-07-07 13:08:27.707
1233	2882	453287105378	AP320812054	ABCDE1722F	2026-07-07 13:08:28.594
1234	2883	453287105432	AP320812072	ABCDE1728F	2026-07-07 13:08:29.341
1235	2884	453287105475	AP320812091	ABCDE1735F	2026-07-07 13:08:30.23
1236	2885	453287105529	AP320812109	ABCDE1741F	2026-07-07 13:08:31.123
1237	2886	453287105572	AP320812128	ABCDE1748F	2026-07-07 13:08:31.941
1238	2887	453287105626	AP320812146	ABCDE1754F	2026-07-07 13:08:32.82
1239	2888	453287105669	AP320812165	ABCDE1761F	2026-07-07 13:08:33.709
1240	2889	453287105723	AP320812183	ABCDE1767F	2026-07-07 13:08:34.655
1241	2890	453287105766	AP320812202	ABCDE1774F	2026-07-07 13:08:35.535
1242	2891	453287105820	AP320812220	ABCDE1780F	2026-07-07 13:08:36.416
1243	2892	453287105863	AP320812239	ABCDE1787F	2026-07-07 13:08:37.249
1244	2893	453287105917	AP320812257	ABCDE1793F	2026-07-07 13:08:38.122
1245	2894	453287105960	AP320812276	ABCDE1800F	2026-07-07 13:08:39.009
1246	2895	453287106014	AP320812294	ABCDE1806F	2026-07-07 13:08:39.9
1247	2896	453287106057	AP320812313	ABCDE1813F	2026-07-07 13:08:40.703
1248	2897	453287106111	AP320812331	ABCDE1819F	2026-07-07 13:08:41.508
1249	2898	453287106154	AP320812350	ABCDE1826F	2026-07-07 13:08:42.402
1161	2810	453287101886	AP320810722	ABCDE1254F	2026-07-07 13:07:27.06
1162	2811	453287101940	AP320810740	ABCDE1260F	2026-07-07 13:07:27.868
1163	2812	453287101983	AP320810759	ABCDE1267F	2026-07-07 13:07:28.755
1164	2813	453287102037	AP320810777	ABCDE1273F	2026-07-07 13:07:29.637
1165	2814	453287102080	AP320810796	ABCDE1280F	2026-07-07 13:07:30.449
1166	2815	453287102134	AP320810814	ABCDE1286F	2026-07-07 13:07:31.319
1167	2816	453287102177	AP320810833	ABCDE1293F	2026-07-07 13:07:32.14
1168	2817	453287102231	AP320810851	ABCDE1299F	2026-07-07 13:07:33.037
1169	2818	453287102274	AP320810870	ABCDE1306F	2026-07-07 13:07:33.853
1170	2819	453287102328	AP320810888	ABCDE1312F	2026-07-07 13:07:34.671
1171	2820	453287102371	AP320810907	ABCDE1319F	2026-07-07 13:07:35.556
1172	2821	453287102425	AP320810925	ABCDE1325F	2026-07-07 13:07:36.427
1173	2822	453287102468	AP320810944	ABCDE1332F	2026-07-07 13:07:37.302
1174	2823	453287102522	AP320810962	ABCDE1338F	2026-07-07 13:07:38.107
1175	2824	453287102565	AP320810981	ABCDE1345F	2026-07-07 13:07:38.915
1176	2825	453287102619	AP320810999	ABCDE1351F	2026-07-07 13:07:39.805
1177	2826	453287102662	AP320811018	ABCDE1358F	2026-07-07 13:07:40.602
1178	2827	453287102716	AP320811036	ABCDE1364F	2026-07-07 13:07:41.527
1179	2828	453287102759	AP320811055	ABCDE1371F	2026-07-07 13:07:42.345
1180	2829	453287102813	AP320811073	ABCDE1377F	2026-07-07 13:07:43.203
1181	2830	453287102856	AP320811092	ABCDE1384F	2026-07-07 13:07:44.08
1182	2831	453287102910	AP320811110	ABCDE1390F	2026-07-07 13:07:44.812
1183	2832	453287102953	AP320811129	ABCDE1397F	2026-07-07 13:07:45.629
1184	2833	453287103007	AP320811147	ABCDE1403F	2026-07-07 13:07:46.425
1185	2834	453287103050	AP320811166	ABCDE1410F	2026-07-07 13:07:47.298
1186	2835	453287103104	AP320811184	ABCDE1416F	2026-07-07 13:07:48.156
1187	2836	453287103147	AP320811203	ABCDE1423F	2026-07-07 13:07:49.019
1188	2837	453287103201	AP320811221	ABCDE1429F	2026-07-07 13:07:49.882
1189	2838	453287103244	AP320811240	ABCDE1436F	2026-07-07 13:07:50.698
1190	2839	453287103298	AP320811258	ABCDE1442F	2026-07-07 13:07:51.563
1191	2840	453287103341	AP320811277	ABCDE1449F	2026-07-07 13:07:52.371
1192	2841	453287103395	AP320811295	ABCDE1455F	2026-07-07 13:07:53.233
1193	2842	453287103438	AP320811314	ABCDE1462F	2026-07-07 13:07:53.967
1194	2843	453287103492	AP320811332	ABCDE1468F	2026-07-07 13:07:54.834
1195	2844	453287103535	AP320811351	ABCDE1475F	2026-07-07 13:07:55.687
1196	2845	453287103589	AP320811369	ABCDE1481F	2026-07-07 13:07:56.553
1197	2846	453287103632	AP320811388	ABCDE1488F	2026-07-07 13:07:57.408
1198	2847	453287103686	AP320811406	ABCDE1494F	2026-07-07 13:07:58.279
1199	2848	453287103729	AP320811425	ABCDE1501F	2026-07-07 13:07:59.08
1200	2849	453287103783	AP320811443	ABCDE1507F	2026-07-07 13:07:59.966
1201	2850	453287103826	AP320811462	ABCDE1514F	2026-07-07 13:08:00.863
1202	2851	453287103880	AP320811480	ABCDE1520F	2026-07-07 13:08:01.676
1203	2852	453287103923	AP320811499	ABCDE1527F	2026-07-07 13:08:02.488
1204	2853	453287103977	AP320811517	ABCDE1533F	2026-07-07 13:08:03.321
1205	2854	453287104020	AP320811536	ABCDE1540F	2026-07-07 13:08:04.194
1206	2855	453287104074	AP320811554	ABCDE1546F	2026-07-07 13:08:05.063
1207	2856	453287104117	AP320811573	ABCDE1553F	2026-07-07 13:08:05.942
1208	2857	453287104171	AP320811591	ABCDE1559F	2026-07-07 13:08:06.816
1209	2858	453287104214	AP320811610	ABCDE1566F	2026-07-07 13:08:07.692
1210	2859	453287104268	AP320811628	ABCDE1572F	2026-07-07 13:08:08.567
1211	2860	453287104311	AP320811647	ABCDE1579F	2026-07-07 13:08:09.384
1212	2861	453287104365	AP320811665	ABCDE1585F	2026-07-07 13:08:10.539
1213	2862	453287104408	AP320811684	ABCDE1592F	2026-07-07 13:08:11.431
1214	2863	453287104462	AP320811702	ABCDE1598F	2026-07-07 13:08:12.371
1215	2864	453287104505	AP320811721	ABCDE1605F	2026-07-07 13:08:13.237
1216	2865	453287104559	AP320811739	ABCDE1611F	2026-07-07 13:08:14.081
\.


--
-- Data for Name: offenders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offenders (id, sl_no, ps_id, full_name, alias, father_husband_name, age, gender, category, full_address, landmark_area, district, state, occupation, monthly_income, photo_url, created_by, created_at, updated_at, test_result, status, risk_score, caste, mandal) FROM stdin;
2771	SL-TPT-026-100	45	Ramesh Babu	ramesh_tpt-026_0	Ramesh Babu	18	FEMALE	CONSUMER	D.No 10-1, Near Junction, Puttur UPS, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	10000.00	\N	\N	2026-07-07 13:06:52.794	2026-07-07 13:06:52.794	POSITIVE	ACTIVE	LOW	\N	\N
2772	SL-TPT-026-101	45	Suresh Prasad	suresh_tpt-026_1	Naveen Prasad	31	MALE	LOCAL_PEDDLER	D.No 10-2, Near Junction, Puttur UPS, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	18000.00	\N	\N	2026-07-07 13:06:54.126	2026-07-07 13:06:54.126	NEGATIVE	ACTIVE	HIGH	\N	\N
2773	SL-ALP-102	6	Manoj Reddy	manoj_alp_0	Prakash Reddy	25	MALE	CONSUMER	D.No 11-1, Near Junction, Alipiri, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	14000.00	\N	\N	2026-07-07 13:06:55.059	2026-07-07 13:06:55.059	POSITIVE	ACTIVE	MEDIUM	\N	\N
2774	SL-ALP-103	6	Venkat Singh	venkat_alp_1	Nagaraju Singh	38	MALE	SUPPLIER	D.No 11-2, Near Junction, Alipiri, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	23000.00	\N	\N	2026-07-07 13:06:55.967	2026-07-07 13:06:55.967	PENDING	ACTIVE	HIGH	\N	\N
2775	SL-TP-EAST-104	1	Rajesh Achari	rajesh_tp-east_0	Ganesh Achari	32	MALE	CONSUMER	D.No 12-1, Near Junction, Tirupathi East, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	18000.00	\N	\N	2026-07-07 13:06:56.832	2026-07-07 13:06:56.832	POSITIVE	ACTIVE	LOW	\N	\N
2776	SL-TP-EAST-105	1	Prakash Varma	prakash_tp-east_1	Kalyan Varma	45	MALE	LOCAL_KINGPIN	D.No 12-2, Near Junction, Tirupathi East, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	90000.00	\N	\N	2026-07-07 13:06:57.713	2026-07-07 13:06:57.713	POSITIVE	ACTIVE	CRITICAL	\N	\N
2777	SL-SRC-106	7	Anil Chakravarthy	anil_src_0	Prasad Chakravarthy	39	MALE	CONSUMER	D.No 13-1, Near Junction, Sri City UPS, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	22000.00	\N	\N	2026-07-07 13:06:58.585	2026-07-07 13:06:58.585	POSITIVE	ACTIVE	MEDIUM	\N	\N
2778	SL-SRC-107	7	Srinivas Patnaik	srinivas_src_1	Gangadhar Patnaik	52	MALE	TRANSPORTER	D.No 13-2, Near Junction, Sri City UPS, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	33000.00	\N	\N	2026-07-07 13:06:59.518	2026-07-07 13:06:59.518	NEGATIVE	ACTIVE	MEDIUM	\N	\N
2779	SL-TPT-048-108	67	Bhaskar Murthy	bhaskar_tpt-048_0	Sudhakar Murthy	46	FEMALE	CONSUMER	D.No 14-1, Near Junction, Tirupati Traffic, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	26000.00	\N	\N	2026-07-07 13:07:00.333	2026-07-07 13:07:00.333	POSITIVE	ACTIVE	LOW	\N	\N
2780	SL-TPT-048-109	67	Naveen Shekar	naveen_tpt-048_1	Ramana Shekar	59	MALE	INTERSTATE_LINK	D.No 14-2, Near Junction, Tirupati Traffic, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	120000.00	\N	\N	2026-07-07 13:07:01.136	2026-07-07 13:07:01.136	PENDING	ACTIVE	CRITICAL	\N	\N
2781	SL-TPT-049-110	68	Ganesh Nayak	ganesh_tpt-049_0	Balaji Nayak	53	MALE	CONSUMER	D.No 15-1, Near Junction, Tirumala Traffic, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	10000.00	\N	\N	2026-07-07 13:07:02.053	2026-07-07 13:07:02.053	POSITIVE	ACTIVE	MEDIUM	\N	\N
2782	SL-TPT-049-111	68	Vijay Babu	vijay_tpt-049_1	Satish Babu	21	MALE	LOCAL_PEDDLER	D.No 15-2, Near Junction, Tirumala Traffic, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	18000.00	\N	\N	2026-07-07 13:07:02.932	2026-07-07 13:07:02.932	POSITIVE	ACTIVE	MEDIUM	\N	\N
2783	SL-TPT-052-112	71	Siva Swamy	siva_tpt-052_0	Krishna Swamy	60	MALE	CONSUMER	D.No 16-1, Near Junction, Mahila UPS Tirupati, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	14000.00	\N	\N	2026-07-07 13:07:03.818	2026-07-07 13:07:03.818	POSITIVE	ACTIVE	LOW	\N	\N
2784	SL-TPT-052-113	71	Hari Reddy	hari_tpt-052_1	Ravi Reddy	28	MALE	SUPPLIER	D.No 16-2, Near Junction, Mahila UPS Tirupati, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	23000.00	\N	\N	2026-07-07 13:07:04.695	2026-07-07 13:07:04.695	NEGATIVE	ACTIVE	CRITICAL	\N	\N
2785	SL-EX-CGR-114	13	Nagaraju Pratap	nagaraju_ex-cgr_0	Raju Pratap	22	MALE	CONSUMER	D.No 17-1, Near Junction, Excise PS CGR, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	18000.00	\N	\N	2026-07-07 13:07:05.575	2026-07-07 13:07:05.575	NEGATIVE	ACTIVE	MEDIUM	\N	\N
2786	SL-EX-CGR-115	13	Prasad Achari	prasad_ex-cgr_1	Chaitu Achari	35	MALE	LOCAL_KINGPIN	D.No 17-2, Near Junction, Excise PS CGR, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	90000.00	\N	\N	2026-07-07 13:07:06.458	2026-07-07 13:07:06.458	PENDING	ACTIVE	HIGH	\N	\N
2787	SL-EX-TML-116	14	Chandra Gowd	chandra_ex-tml_0	Koti Gowd	29	FEMALE	CONSUMER	D.No 18-1, Near Junction, Excise PS TML, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	22000.00	\N	\N	2026-07-07 13:07:07.27	2026-07-07 13:07:07.27	NEGATIVE	ACTIVE	LOW	\N	\N
2788	SL-EX-TML-117	14	Madhava Chakravarthy	madhava_ex-tml_1	Venkat Chakravarthy	42	MALE	TRANSPORTER	D.No 18-2, Near Junction, Excise PS TML, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	33000.00	\N	\N	2026-07-07 13:07:08.069	2026-07-07 13:07:08.069	POSITIVE	ACTIVE	HIGH	\N	\N
2789	SL-EX-GDR-118	15	Ravindra Rao	ravindra_ex-gdr_0	Babji Rao	36	MALE	CONSUMER	D.No 19-1, Near Junction, Excise PS GDR, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	26000.00	\N	\N	2026-07-07 13:07:08.944	2026-07-07 13:07:08.944	PENDING	ACTIVE	MEDIUM	\N	\N
2790	SL-EX-GDR-119	15	Kalyan Murthy	kalyan_ex-gdr_1	Bhaskar Murthy	49	MALE	INTERSTATE_LINK	D.No 19-2, Near Junction, Excise PS GDR, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	120000.00	\N	\N	2026-07-07 13:07:09.83	2026-07-07 13:07:09.83	NEGATIVE	ACTIVE	HIGH	\N	\N
2791	SL-EX-NDP-120	16	Sudhakar Shankar	sudhakar_ex-ndp_0	Rajesh Shankar	43	MALE	CONSUMER	D.No 20-1, Near Junction, Excise PS NDP, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	10000.00	\N	\N	2026-07-07 13:07:10.774	2026-07-07 13:07:10.774	POSITIVE	ACTIVE	LOW	\N	\N
2792	SL-EX-NDP-121	16	Narendra Nayak	narendra_ex-ndp_1	Hari Nayak	56	MALE	LOCAL_PEDDLER	D.No 20-2, Near Junction, Excise PS NDP, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	18000.00	\N	\N	2026-07-07 13:07:11.579	2026-07-07 13:07:11.579	PENDING	ACTIVE	HIGH	\N	\N
2793	SL-EX-SLPT-122	17	Mohan Sastry	mohan_ex-slpt_0	Naveen Sastry	50	MALE	CONSUMER	D.No 21-1, Near Junction, Excise PS SLPT, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	14000.00	\N	\N	2026-07-07 13:07:12.394	2026-07-07 13:07:12.394	POSITIVE	ACTIVE	MEDIUM	\N	\N
2794	SL-EX-SLPT-123	17	Jaya Swamy	jaya_ex-slpt_1	Ravindra Swamy	18	MALE	SUPPLIER	D.No 21-2, Near Junction, Excise PS SLPT, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	23000.00	\N	\N	2026-07-07 13:07:13.267	2026-07-07 13:07:13.267	POSITIVE	ACTIVE	HIGH	\N	\N
2795	SL-EX-VKD-124	18	Gangadhar Raju	gangadhar_ex-vkd_0	Nagaraju Raju	57	FEMALE	CONSUMER	D.No 22-1, Near Junction, Excise PS VKD, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	18000.00	\N	\N	2026-07-07 13:07:14.144	2026-07-07 13:07:14.144	POSITIVE	ACTIVE	LOW	\N	\N
2796	SL-EX-VKD-125	18	Balaji Pratap	balaji_ex-vkd_1	Jaya Pratap	25	MALE	LOCAL_KINGPIN	D.No 22-2, Near Junction, Excise PS VKD, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	90000.00	\N	\N	2026-07-07 13:07:15.021	2026-07-07 13:07:15.021	NEGATIVE	ACTIVE	CRITICAL	\N	\N
2797	SL-EX-VGR-126	19	Subramanyam Choudhary	subramanyam_ex-vgr_0	Kalyan Choudhary	19	MALE	CONSUMER	D.No 23-1, Near Junction, Excise PS VGR, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	22000.00	\N	\N	2026-07-07 13:07:15.902	2026-07-07 13:07:15.902	POSITIVE	ACTIVE	MEDIUM	\N	\N
2798	SL-EX-VGR-127	19	Lokesh Gowd	lokesh_ex-vgr_1	Naresh Gowd	32	MALE	TRANSPORTER	D.No 23-2, Near Junction, Excise PS VGR, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	33000.00	\N	\N	2026-07-07 13:07:16.723	2026-07-07 13:07:16.723	PENDING	ACTIVE	MEDIUM	\N	\N
2799	SL-TPT-001-128	20	Naresh Teja	naresh_tpt-001_0	Gangadhar Teja	26	MALE	CONSUMER	D.No 24-1, Near Junction, Naidupeta UPS, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	26000.00	\N	\N	2026-07-07 13:07:17.546	2026-07-07 13:07:17.546	POSITIVE	ACTIVE	LOW	\N	\N
2800	SL-TPT-001-129	20	Ramana Rao	ramana_tpt-001_1	Kiran Rao	39	MALE	INTERSTATE_LINK	D.No 24-2, Near Junction, Naidupeta UPS, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	120000.00	\N	\N	2026-07-07 13:07:18.348	2026-07-07 13:07:18.348	POSITIVE	ACTIVE	CRITICAL	\N	\N
2801	SL-TPT-002-130	21	Krishna Kumar	krishna_tpt-002_0	Ramana Kumar	33	MALE	CONSUMER	D.No 25-1, Near Junction, Doravari Satram, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	10000.00	\N	\N	2026-07-07 13:07:19.25	2026-07-07 13:07:19.25	POSITIVE	ACTIVE	MEDIUM	\N	\N
2802	SL-TPT-002-131	21	Anand Shankar	anand_tpt-002_1	Pavan Shankar	46	MALE	LOCAL_PEDDLER	D.No 25-2, Near Junction, Doravari Satram, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	18000.00	\N	\N	2026-07-07 13:07:20.074	2026-07-07 13:07:20.074	NEGATIVE	ACTIVE	MEDIUM	\N	\N
2803	SL-TPT-003-132	22	Mahesh Naidu	mahesh_tpt-003_0	Satish Naidu	40	FEMALE	CONSUMER	D.No 26-1, Near Junction, Ozili, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	14000.00	\N	\N	2026-07-07 13:07:20.883	2026-07-07 13:07:20.883	POSITIVE	ACTIVE	LOW	\N	\N
2804	SL-TPT-003-133	22	Kiran Sastry	kiran_tpt-003_1	Konda Sastry	53	MALE	SUPPLIER	D.No 26-2, Near Junction, Ozili, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	23000.00	\N	\N	2026-07-07 13:07:21.697	2026-07-07 13:07:21.697	PENDING	ACTIVE	CRITICAL	\N	\N
2805	SL-TPT-004-134	23	Satish Prasad	satish_tpt-004_0	Ravi Prasad	47	MALE	CONSUMER	D.No 27-1, Near Junction, Pellakur, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	18000.00	\N	\N	2026-07-07 13:07:22.58	2026-07-07 13:07:22.58	NEGATIVE	ACTIVE	MEDIUM	\N	\N
2806	SL-TPT-004-135	23	Raju Raju	raju_tpt-004_1	Manoj Raju	60	MALE	LOCAL_KINGPIN	D.No 27-2, Near Junction, Pellakur, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	90000.00	\N	\N	2026-07-07 13:07:23.472	2026-07-07 13:07:23.472	POSITIVE	ACTIVE	HIGH	\N	\N
2807	SL-TPT-005-136	24	Gopal Singh	gopal_tpt-005_0	Chaitu Singh	54	MALE	CONSUMER	D.No 28-1, Near Junction, Sriharikota, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	22000.00	\N	\N	2026-07-07 13:07:24.345	2026-07-07 13:07:24.345	NEGATIVE	ACTIVE	LOW	\N	\N
2808	SL-TPT-005-137	24	Sekhar Choudhary	sekhar_tpt-005_1	Srinivas Choudhary	22	MALE	TRANSPORTER	D.No 28-2, Near Junction, Sriharikota, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	33000.00	\N	\N	2026-07-07 13:07:25.24	2026-07-07 13:07:25.24	NEGATIVE	ACTIVE	HIGH	\N	\N
2809	SL-TPT-006-138	25	Pavan Varma	pavan_tpt-006_0	Venkat Varma	61	MALE	CONSUMER	D.No 29-1, Near Junction, Sullurpet, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	26000.00	\N	\N	2026-07-07 13:07:26.18	2026-07-07 13:07:26.18	PENDING	ACTIVE	MEDIUM	\N	\N
2868	SL-CGR-PS-197	5	Prakash Shekar	prakash_cgr-ps_1	Kalyan Shekar	52	MALE	TRANSPORTER	D.No 58-2, Near Junction, Chandragiri UPS, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	33000.00	\N	\N	2026-07-07 13:08:16.58	2026-07-07 13:08:16.58	NEGATIVE	ACTIVE	HIGH	\N	\N
2869	SL-TPT-037-198	56	Anil Nayak	anil_tpt-037_0	Prasad Nayak	46	MALE	CONSUMER	D.No 59-1, Near Junction, RC Puram, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	26000.00	\N	\N	2026-07-07 13:08:17.401	2026-07-07 13:08:17.401	PENDING	ACTIVE	MEDIUM	\N	\N
2870	SL-TPT-037-199	56	Srinivas Babu	srinivas_tpt-037_1	Gangadhar Babu	59	MALE	INTERSTATE_LINK	D.No 59-2, Near Junction, RC Puram, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	120000.00	\N	\N	2026-07-07 13:08:18.284	2026-07-07 13:08:18.284	PENDING	ACTIVE	HIGH	\N	\N
2871	SL-TPT-038-200	57	Bhaskar Swamy	bhaskar_tpt-038_0	Sudhakar Swamy	53	MALE	CONSUMER	D.No 60-1, Near Junction, Pakala UPS, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	10000.00	\N	\N	2026-07-07 13:08:19.096	2026-07-07 13:08:19.096	POSITIVE	ACTIVE	LOW	\N	\N
2872	SL-TPT-038-201	57	Naveen Reddy	naveen_tpt-038_1	Ramana Reddy	21	MALE	LOCAL_PEDDLER	D.No 60-2, Near Junction, Pakala UPS, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	18000.00	\N	\N	2026-07-07 13:08:20.042	2026-07-07 13:08:20.042	POSITIVE	ACTIVE	HIGH	\N	\N
2873	SL-TPT-039-202	58	Ganesh Pratap	ganesh_tpt-039_0	Balaji Pratap	60	MALE	CONSUMER	D.No 61-1, Near Junction, Bhakarapet, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	14000.00	\N	\N	2026-07-07 13:08:20.919	2026-07-07 13:08:20.919	POSITIVE	ACTIVE	MEDIUM	\N	\N
2874	SL-TPT-039-203	58	Vijay Achari	vijay_tpt-039_1	Satish Achari	28	MALE	SUPPLIER	D.No 61-2, Near Junction, Bhakarapet, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	23000.00	\N	\N	2026-07-07 13:08:21.733	2026-07-07 13:08:21.733	NEGATIVE	ACTIVE	HIGH	\N	\N
2875	SL-TPT-040-204	59	Siva Gowd	siva_tpt-040_0	Krishna Gowd	22	FEMALE	CONSUMER	D.No 62-1, Near Junction, Yerravaripalem, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	18000.00	\N	\N	2026-07-07 13:08:22.611	2026-07-07 13:08:22.611	POSITIVE	ACTIVE	LOW	\N	\N
2876	SL-TPT-040-205	59	Hari Chakravarthy	hari_tpt-040_1	Ravi Chakravarthy	35	MALE	LOCAL_KINGPIN	D.No 62-2, Near Junction, Yerravaripalem, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	90000.00	\N	\N	2026-07-07 13:08:23.49	2026-07-07 13:08:23.49	PENDING	ACTIVE	CRITICAL	\N	\N
2877	SL-TP-WEST-206	2	Nagaraju Rao	nagaraju_tp-west_0	Raju Rao	29	MALE	CONSUMER	D.No 63-1, Near Junction, Tirupathi West, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	22000.00	\N	\N	2026-07-07 13:08:24.286	2026-07-07 13:08:24.286	POSITIVE	ACTIVE	MEDIUM	\N	\N
2878	SL-TP-WEST-207	2	Prasad Murthy	prasad_tp-west_1	Chaitu Murthy	42	MALE	TRANSPORTER	D.No 63-2, Near Junction, Tirupathi West, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	33000.00	\N	\N	2026-07-07 13:08:25.153	2026-07-07 13:08:25.153	POSITIVE	ACTIVE	MEDIUM	\N	\N
2879	SL-TPT-044-208	63	Chandra Shankar	chandra_tpt-044_0	Koti Shankar	36	MALE	CONSUMER	D.No 64-1, Near Junction, S.V.U.Campus, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	26000.00	\N	\N	2026-07-07 13:08:26.041	2026-07-07 13:08:26.041	POSITIVE	ACTIVE	LOW	\N	\N
2880	SL-TPT-044-209	63	Madhava Nayak	madhava_tpt-044_1	Venkat Nayak	49	MALE	INTERSTATE_LINK	D.No 64-2, Near Junction, S.V.U.Campus, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	120000.00	\N	\N	2026-07-07 13:08:26.892	2026-07-07 13:08:26.892	NEGATIVE	ACTIVE	CRITICAL	\N	\N
2881	SL-TPT-045-210	64	Ravindra Sastry	ravindra_tpt-045_0	Babji Sastry	43	MALE	CONSUMER	D.No 65-1, Near Junction, Tirumala I Town, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	10000.00	\N	\N	2026-07-07 13:08:27.707	2026-07-07 13:08:27.707	POSITIVE	ACTIVE	MEDIUM	\N	\N
2882	SL-TPT-045-211	64	Kalyan Swamy	kalyan_tpt-045_1	Bhaskar Swamy	56	MALE	LOCAL_PEDDLER	D.No 65-2, Near Junction, Tirumala I Town, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	18000.00	\N	\N	2026-07-07 13:08:28.594	2026-07-07 13:08:28.594	PENDING	ACTIVE	MEDIUM	\N	\N
2883	SL-TPT-046-212	65	Sudhakar Raju	sudhakar_tpt-046_0	Rajesh Raju	50	FEMALE	CONSUMER	D.No 66-1, Near Junction, Tirumala II Town, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	14000.00	\N	\N	2026-07-07 13:08:29.341	2026-07-07 13:08:29.341	POSITIVE	ACTIVE	LOW	\N	\N
2884	SL-TPT-046-213	65	Narendra Pratap	narendra_tpt-046_1	Hari Pratap	18	MALE	SUPPLIER	D.No 66-2, Near Junction, Tirumala II Town, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	23000.00	\N	\N	2026-07-07 13:08:30.23	2026-07-07 13:08:30.23	POSITIVE	ACTIVE	CRITICAL	\N	\N
2885	SL-TPT-050-214	69	Mohan Choudhary	mohan_tpt-050_0	Naveen Choudhary	57	MALE	CONSUMER	D.No 67-1, Near Junction, CCS , Tirupathi, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	18000.00	\N	\N	2026-07-07 13:08:31.123	2026-07-07 13:08:31.123	NEGATIVE	ACTIVE	MEDIUM	\N	\N
2886	SL-TPT-050-215	69	Jaya Gowd	jaya_tpt-050_1	Ravindra Gowd	25	MALE	LOCAL_KINGPIN	D.No 67-2, Near Junction, CCS , Tirupathi, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	90000.00	\N	\N	2026-07-07 13:08:31.941	2026-07-07 13:08:31.941	NEGATIVE	ACTIVE	HIGH	\N	\N
2810	SL-TPT-006-139	25	Ravi Teja	ravi_tpt-006_1	Siva Teja	29	MALE	INTERSTATE_LINK	D.No 29-2, Near Junction, Sullurpet, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	120000.00	\N	\N	2026-07-07 13:07:27.06	2026-07-07 13:07:27.06	PENDING	ACTIVE	HIGH	\N	\N
2811	SL-TPT-007-140	26	Koti Patnaik	koti_tpt-007_0	Bhaskar Patnaik	23	FEMALE	CONSUMER	D.No 30-1, Near Junction, Tada, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	10000.00	\N	\N	2026-07-07 13:07:27.868	2026-07-07 13:07:27.868	POSITIVE	ACTIVE	LOW	\N	\N
2812	SL-TPT-007-141	26	Vamsi Kumar	vamsi_tpt-007_1	Madhava Kumar	36	MALE	LOCAL_PEDDLER	D.No 30-2, Near Junction, Tada, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	18000.00	\N	\N	2026-07-07 13:07:28.755	2026-07-07 13:07:28.755	POSITIVE	ACTIVE	HIGH	\N	\N
2813	SL-TPT-008-142	27	Apparao Shekar	apparao_tpt-008_0	Hari Shekar	30	MALE	CONSUMER	D.No 31-1, Near Junction, Balayapalli, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	14000.00	\N	\N	2026-07-07 13:07:29.637	2026-07-07 13:07:29.637	POSITIVE	ACTIVE	MEDIUM	\N	\N
2814	SL-TPT-008-143	27	Konda Naidu	konda_tpt-008_1	Mohan Naidu	43	MALE	SUPPLIER	D.No 31-2, Near Junction, Balayapalli, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	23000.00	\N	\N	2026-07-07 13:07:30.449	2026-07-07 13:07:30.449	NEGATIVE	ACTIVE	HIGH	\N	\N
2815	SL-TPT-009-144	28	Chaitu Babu	chaitu_tpt-009_0	Ravindra Babu	37	MALE	CONSUMER	D.No 32-1, Near Junction, Venkatagiri, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	18000.00	\N	\N	2026-07-07 13:07:31.319	2026-07-07 13:07:31.319	POSITIVE	ACTIVE	LOW	\N	\N
2816	SL-TPT-009-145	28	Babji Prasad	babji_tpt-009_1	Lokesh Prasad	50	MALE	LOCAL_KINGPIN	D.No 32-2, Near Junction, Venkatagiri, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	90000.00	\N	\N	2026-07-07 13:07:32.14	2026-07-07 13:07:32.14	PENDING	ACTIVE	CRITICAL	\N	\N
2817	SL-TPT-010-146	29	Ramesh Reddy	ramesh_tpt-010_0	Jaya Reddy	44	MALE	CONSUMER	D.No 33-1, Near Junction, Dakkili, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	22000.00	\N	\N	2026-07-07 13:07:33.037	2026-07-07 13:07:33.037	POSITIVE	ACTIVE	MEDIUM	\N	\N
2818	SL-TPT-010-147	29	Suresh Singh	suresh_tpt-010_1	Mahesh Singh	57	MALE	TRANSPORTER	D.No 33-2, Near Junction, Dakkili, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	33000.00	\N	\N	2026-07-07 13:07:33.853	2026-07-07 13:07:33.853	POSITIVE	ACTIVE	MEDIUM	\N	\N
2819	SL-TPT-011-148	30	Manoj Achari	manoj_tpt-011_0	Naresh Achari	51	FEMALE	CONSUMER	D.No 34-1, Near Junction, Chittamuru, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	26000.00	\N	\N	2026-07-07 13:07:34.671	2026-07-07 13:07:34.671	POSITIVE	ACTIVE	LOW	\N	\N
2820	SL-TPT-011-149	30	Venkat Varma	venkat_tpt-011_1	Sekhar Varma	19	MALE	INTERSTATE_LINK	D.No 34-2, Near Junction, Chittamuru, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	120000.00	\N	\N	2026-07-07 13:07:35.556	2026-07-07 13:07:35.556	NEGATIVE	ACTIVE	CRITICAL	\N	\N
2821	SL-TPT-012-150	31	Rajesh Chakravarthy	rajesh_tpt-012_0	Kiran Chakravarthy	58	MALE	CONSUMER	D.No 35-1, Near Junction, Vakadu, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	10000.00	\N	\N	2026-07-07 13:07:36.427	2026-07-07 13:07:36.427	POSITIVE	ACTIVE	MEDIUM	\N	\N
2822	SL-TPT-012-151	31	Prakash Patnaik	prakash_tpt-012_1	Apparao Patnaik	26	MALE	LOCAL_PEDDLER	D.No 35-2, Near Junction, Vakadu, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	18000.00	\N	\N	2026-07-07 13:07:37.302	2026-07-07 13:07:37.302	PENDING	ACTIVE	MEDIUM	\N	\N
2823	SL-TPT-013-152	32	Anil Murthy	anil_tpt-013_0	Pavan Murthy	20	MALE	CONSUMER	D.No 36-1, Near Junction, Srikalahasthi I Town, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	14000.00	\N	\N	2026-07-07 13:07:38.107	2026-07-07 13:07:38.107	POSITIVE	ACTIVE	LOW	\N	\N
2824	SL-TPT-013-153	32	Srinivas Shekar	srinivas_tpt-013_1	Suresh Shekar	33	MALE	SUPPLIER	D.No 36-2, Near Junction, Srikalahasthi I Town, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	23000.00	\N	\N	2026-07-07 13:07:38.915	2026-07-07 13:07:38.915	POSITIVE	ACTIVE	CRITICAL	\N	\N
2825	SL-TPT-014-154	33	Bhaskar Nayak	bhaskar_tpt-014_0	Konda Nayak	27	MALE	CONSUMER	D.No 37-1, Near Junction, Srikalahasti II Town, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	18000.00	\N	\N	2026-07-07 13:07:39.805	2026-07-07 13:07:39.805	NEGATIVE	ACTIVE	MEDIUM	\N	\N
2826	SL-TPT-014-155	33	Naveen Babu	naveen_tpt-014_1	Anil Babu	40	MALE	LOCAL_KINGPIN	D.No 37-2, Near Junction, Srikalahasti II Town, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	90000.00	\N	\N	2026-07-07 13:07:40.602	2026-07-07 13:07:40.602	NEGATIVE	ACTIVE	HIGH	\N	\N
2827	SL-TPT-015-156	34	Ganesh Swamy	ganesh_tpt-015_0	Manoj Swamy	34	FEMALE	CONSUMER	D.No 38-1, Near Junction, Srikalahasthi Rural, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	22000.00	\N	\N	2026-07-07 13:07:41.527	2026-07-07 13:07:41.527	NEGATIVE	ACTIVE	LOW	\N	\N
2828	SL-TPT-015-157	34	Vijay Reddy	vijay_tpt-015_1	Vijay Reddy	47	MALE	TRANSPORTER	D.No 38-2, Near Junction, Srikalahasthi Rural, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	33000.00	\N	\N	2026-07-07 13:07:42.345	2026-07-07 13:07:42.345	PENDING	ACTIVE	HIGH	\N	\N
2829	SL-TPT-016-158	35	Siva Pratap	siva_tpt-016_0	Srinivas Pratap	41	MALE	CONSUMER	D.No 39-1, Near Junction, BN Kandriga, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	26000.00	\N	\N	2026-07-07 13:07:43.203	2026-07-07 13:07:43.203	PENDING	ACTIVE	MEDIUM	\N	\N
2830	SL-TPT-016-159	35	Hari Achari	hari_tpt-016_1	Chandra Achari	54	MALE	INTERSTATE_LINK	D.No 39-2, Near Junction, BN Kandriga, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	120000.00	\N	\N	2026-07-07 13:07:44.08	2026-07-07 13:07:44.08	POSITIVE	ACTIVE	HIGH	\N	\N
2831	SL-TPT-017-160	36	Nagaraju Gowd	nagaraju_tpt-017_0	Siva Gowd	48	MALE	CONSUMER	D.No 40-1, Near Junction, Thotambedu, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	10000.00	\N	\N	2026-07-07 13:07:44.812	2026-07-07 13:07:44.812	POSITIVE	ACTIVE	LOW	\N	\N
2832	SL-TPT-017-161	36	Prasad Chakravarthy	prasad_tpt-017_1	Narendra Chakravarthy	61	MALE	LOCAL_PEDDLER	D.No 40-2, Near Junction, Thotambedu, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	18000.00	\N	\N	2026-07-07 13:07:45.629	2026-07-07 13:07:45.629	NEGATIVE	ACTIVE	HIGH	\N	\N
2833	SL-RGT-162	4	Chandra Rao	chandra_rgt_0	Madhava Rao	55	MALE	CONSUMER	D.No 41-1, Near Junction, Renigunta UPS, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	14000.00	\N	\N	2026-07-07 13:07:46.425	2026-07-07 13:07:46.425	POSITIVE	ACTIVE	MEDIUM	\N	\N
2834	SL-RGT-163	4	Madhava Murthy	madhava_rgt_1	Subramanyam Murthy	23	MALE	SUPPLIER	D.No 41-2, Near Junction, Renigunta UPS, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	23000.00	\N	\N	2026-07-07 13:07:47.298	2026-07-07 13:07:47.298	PENDING	ACTIVE	HIGH	\N	\N
2835	SL-TPT-019-164	38	Ravindra Shankar	ravindra_tpt-019_0	Mohan Shankar	62	FEMALE	CONSUMER	D.No 42-1, Near Junction, Yerpedu UPS, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	18000.00	\N	\N	2026-07-07 13:07:48.156	2026-07-07 13:07:48.156	POSITIVE	ACTIVE	LOW	\N	\N
2836	SL-TPT-019-165	38	Kalyan Nayak	kalyan_tpt-019_1	Anand Nayak	30	MALE	LOCAL_KINGPIN	D.No 42-2, Near Junction, Yerpedu UPS, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	90000.00	\N	\N	2026-07-07 13:07:49.019	2026-07-07 13:07:49.019	POSITIVE	ACTIVE	CRITICAL	\N	\N
2837	SL-TPT-020-166	39	Sudhakar Sastry	sudhakar_tpt-020_0	Lokesh Sastry	24	MALE	CONSUMER	D.No 43-1, Near Junction, Chitvel, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	22000.00	\N	\N	2026-07-07 13:07:49.882	2026-07-07 13:07:49.882	POSITIVE	ACTIVE	MEDIUM	\N	\N
2838	SL-TPT-020-167	39	Narendra Swamy	narendra_tpt-020_1	Gopal Swamy	37	MALE	TRANSPORTER	D.No 43-2, Near Junction, Chitvel, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	33000.00	\N	\N	2026-07-07 13:07:50.698	2026-07-07 13:07:50.698	NEGATIVE	ACTIVE	MEDIUM	\N	\N
2839	SL-TPT-021-168	40	Mohan Raju	mohan_tpt-021_0	Mahesh Raju	31	MALE	CONSUMER	D.No 44-1, Near Junction, Obulavaripalli, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	26000.00	\N	\N	2026-07-07 13:07:51.563	2026-07-07 13:07:51.563	POSITIVE	ACTIVE	LOW	\N	\N
2840	SL-TPT-021-169	40	Jaya Pratap	jaya_tpt-021_1	Vamsi Pratap	44	MALE	INTERSTATE_LINK	D.No 44-2, Near Junction, Obulavaripalli, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	120000.00	\N	\N	2026-07-07 13:07:52.371	2026-07-07 13:07:52.371	PENDING	ACTIVE	CRITICAL	\N	\N
2841	SL-TPT-022-170	41	Gangadhar Choudhary	gangadhar_tpt-022_0	Sekhar Choudhary	38	MALE	CONSUMER	D.No 45-1, Near Junction, Penagalur, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	10000.00	\N	\N	2026-07-07 13:07:53.233	2026-07-07 13:07:53.233	POSITIVE	ACTIVE	MEDIUM	\N	\N
2842	SL-TPT-022-171	41	Balaji Gowd	balaji_tpt-022_1	Ramesh Gowd	51	MALE	LOCAL_PEDDLER	D.No 45-2, Near Junction, Penagalur, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	18000.00	\N	\N	2026-07-07 13:07:53.967	2026-07-07 13:07:53.967	POSITIVE	ACTIVE	MEDIUM	\N	\N
2843	SL-TPT-023-172	42	Subramanyam Teja	subramanyam_tpt-023_0	Apparao Teja	45	FEMALE	CONSUMER	D.No 46-1, Near Junction, Pullampeta, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	14000.00	\N	\N	2026-07-07 13:07:54.834	2026-07-07 13:07:54.834	POSITIVE	ACTIVE	LOW	\N	\N
2844	SL-TPT-023-173	42	Lokesh Rao	lokesh_tpt-023_1	Prakash Rao	58	MALE	SUPPLIER	D.No 46-2, Near Junction, Pullampeta, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	23000.00	\N	\N	2026-07-07 13:07:55.687	2026-07-07 13:07:55.687	NEGATIVE	ACTIVE	CRITICAL	\N	\N
2845	SL-TPT-024-174	43	Naresh Kumar	naresh_tpt-024_0	Suresh Kumar	52	MALE	CONSUMER	D.No 47-1, Near Junction, Airport, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	18000.00	\N	\N	2026-07-07 13:07:56.553	2026-07-07 13:07:56.553	NEGATIVE	ACTIVE	MEDIUM	\N	\N
2846	SL-TPT-024-175	43	Ramana Shankar	ramana_tpt-024_1	Ganesh Shankar	20	MALE	LOCAL_KINGPIN	D.No 47-2, Near Junction, Airport, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	90000.00	\N	\N	2026-07-07 13:07:57.408	2026-07-07 13:07:57.408	PENDING	ACTIVE	HIGH	\N	\N
2847	SL-TPT-025-176	44	Krishna Naidu	krishna_tpt-025_0	Anil Naidu	59	MALE	CONSUMER	D.No 48-1, Near Junction, Gajulamandyam, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	22000.00	\N	\N	2026-07-07 13:07:58.279	2026-07-07 13:07:58.279	NEGATIVE	ACTIVE	LOW	\N	\N
2848	SL-TPT-025-177	44	Anand Sastry	anand_tpt-025_1	Prasad Sastry	27	MALE	TRANSPORTER	D.No 48-2, Near Junction, Gajulamandyam, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	33000.00	\N	\N	2026-07-07 13:07:59.08	2026-07-07 13:07:59.08	POSITIVE	ACTIVE	HIGH	\N	\N
2849	SL-TPT-027-178	46	Mahesh Prasad	mahesh_tpt-027_0	Vijay Prasad	21	MALE	CONSUMER	D.No 49-1, Near Junction, Narayanavanam, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	26000.00	\N	\N	2026-07-07 13:07:59.966	2026-07-07 13:07:59.966	PENDING	ACTIVE	MEDIUM	\N	\N
2850	SL-TPT-027-179	46	Kiran Raju	kiran_tpt-027_1	Sudhakar Raju	34	MALE	INTERSTATE_LINK	D.No 49-2, Near Junction, Narayanavanam, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	120000.00	\N	\N	2026-07-07 13:08:00.863	2026-07-07 13:08:00.863	NEGATIVE	ACTIVE	HIGH	\N	\N
2851	SL-TPT-028-180	47	Satish Singh	satish_tpt-028_0	Chandra Singh	28	FEMALE	CONSUMER	D.No 50-1, Near Junction, Pitchatoor, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	10000.00	\N	\N	2026-07-07 13:08:01.676	2026-07-07 13:08:01.676	POSITIVE	ACTIVE	LOW	\N	\N
2852	SL-TPT-028-181	47	Raju Choudhary	raju_tpt-028_1	Balaji Choudhary	41	MALE	LOCAL_PEDDLER	D.No 50-2, Near Junction, Pitchatoor, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	18000.00	\N	\N	2026-07-07 13:08:02.488	2026-07-07 13:08:02.488	PENDING	ACTIVE	HIGH	\N	\N
2853	SL-TPT-029-182	48	Gopal Varma	gopal_tpt-029_0	Narendra Varma	35	MALE	CONSUMER	D.No 51-1, Near Junction, K.V.B.Puram, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	14000.00	\N	\N	2026-07-07 13:08:03.321	2026-07-07 13:08:03.321	POSITIVE	ACTIVE	MEDIUM	\N	\N
2854	SL-TPT-029-183	48	Sekhar Teja	sekhar_tpt-029_1	Krishna Teja	48	MALE	SUPPLIER	D.No 51-2, Near Junction, K.V.B.Puram, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	23000.00	\N	\N	2026-07-07 13:08:04.194	2026-07-07 13:08:04.194	POSITIVE	ACTIVE	HIGH	\N	\N
2855	SL-TPT-030-184	49	Pavan Patnaik	pavan_tpt-030_0	Subramanyam Patnaik	42	MALE	CONSUMER	D.No 52-1, Near Junction, Vadamalpet, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	18000.00	\N	\N	2026-07-07 13:08:05.063	2026-07-07 13:08:05.063	POSITIVE	ACTIVE	LOW	\N	\N
2856	SL-TPT-030-185	49	Ravi Kumar	ravi_tpt-030_1	Raju Kumar	55	MALE	LOCAL_KINGPIN	D.No 52-2, Near Junction, Vadamalpet, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	90000.00	\N	\N	2026-07-07 13:08:05.942	2026-07-07 13:08:05.942	NEGATIVE	ACTIVE	CRITICAL	\N	\N
2857	SL-TPT-031-186	50	Koti Shekar	koti_tpt-031_0	Anand Shekar	49	MALE	CONSUMER	D.No 53-1, Near Junction, Nagalapuram, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	22000.00	\N	\N	2026-07-07 13:08:06.816	2026-07-07 13:08:06.816	POSITIVE	ACTIVE	MEDIUM	\N	\N
2858	SL-TPT-031-187	50	Vamsi Naidu	vamsi_tpt-031_1	Koti Naidu	62	MALE	TRANSPORTER	D.No 53-2, Near Junction, Nagalapuram, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	33000.00	\N	\N	2026-07-07 13:08:07.692	2026-07-07 13:08:07.692	PENDING	ACTIVE	MEDIUM	\N	\N
2859	SL-TPT-032-188	51	Apparao Babu	apparao_tpt-032_0	Gopal Babu	56	FEMALE	CONSUMER	D.No 54-1, Near Junction, Satyavedu, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	26000.00	\N	\N	2026-07-07 13:08:08.567	2026-07-07 13:08:08.567	POSITIVE	ACTIVE	LOW	\N	\N
2860	SL-TPT-032-189	51	Konda Prasad	konda_tpt-032_1	Babji Prasad	24	MALE	INTERSTATE_LINK	D.No 54-2, Near Junction, Satyavedu, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	120000.00	\N	\N	2026-07-07 13:08:09.384	2026-07-07 13:08:09.384	POSITIVE	ACTIVE	CRITICAL	\N	\N
2861	SL-TPT-033-190	52	Chaitu Reddy	chaitu_tpt-033_0	Vamsi Reddy	18	MALE	CONSUMER	D.No 55-1, Near Junction, Vardaiahpalem, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	10000.00	\N	\N	2026-07-07 13:08:10.539	2026-07-07 13:08:10.539	POSITIVE	ACTIVE	MEDIUM	\N	\N
2862	SL-TPT-033-191	52	Babji Singh	babji_tpt-033_1	Rajesh Singh	31	MALE	LOCAL_PEDDLER	D.No 55-2, Near Junction, Vardaiahpalem, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	18000.00	\N	\N	2026-07-07 13:08:11.431	2026-07-07 13:08:11.431	NEGATIVE	ACTIVE	MEDIUM	\N	\N
2863	SL-TCR-192	3	Ramesh Achari	ramesh_tcr_0	Ramesh Achari	25	MALE	CONSUMER	D.No 56-1, Near Junction, Tirchanur UPS, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	14000.00	\N	\N	2026-07-07 13:08:12.371	2026-07-07 13:08:12.371	POSITIVE	ACTIVE	LOW	\N	\N
2864	SL-TCR-193	3	Suresh Varma	suresh_tcr_1	Naveen Varma	38	MALE	SUPPLIER	D.No 56-2, Near Junction, Tirchanur UPS, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	23000.00	\N	\N	2026-07-07 13:08:13.237	2026-07-07 13:08:13.237	PENDING	ACTIVE	CRITICAL	\N	\N
2865	SL-TPT-035-194	54	Manoj Chakravarthy	manoj_tpt-035_0	Prakash Chakravarthy	32	MALE	CONSUMER	D.No 57-1, Near Junction, Tirupati Rural UPS, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	18000.00	\N	\N	2026-07-07 13:08:14.081	2026-07-07 13:08:14.081	NEGATIVE	ACTIVE	MEDIUM	\N	\N
2866	SL-TPT-035-195	54	Venkat Patnaik	venkat_tpt-035_1	Nagaraju Patnaik	45	MALE	LOCAL_KINGPIN	D.No 57-2, Near Junction, Tirupati Rural UPS, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	90000.00	\N	\N	2026-07-07 13:08:14.967	2026-07-07 13:08:14.967	POSITIVE	ACTIVE	HIGH	\N	\N
2867	SL-CGR-PS-196	5	Rajesh Murthy	rajesh_cgr-ps_0	Ganesh Murthy	39	FEMALE	CONSUMER	D.No 58-1, Near Junction, Chandragiri UPS, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	22000.00	\N	\N	2026-07-07 13:08:15.769	2026-07-07 13:08:15.769	NEGATIVE	ACTIVE	LOW	\N	\N
2887	SL-TPT-051-216	70	Gangadhar Teja	gangadhar_tpt-051_0	Nagaraju Teja	19	MALE	CONSUMER	D.No 68-1, Near Junction, CCS , Tirumala, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	22000.00	\N	\N	2026-07-07 13:08:32.82	2026-07-07 13:08:32.82	NEGATIVE	ACTIVE	LOW	\N	\N
2888	SL-TPT-051-217	70	Balaji Rao	balaji_tpt-051_1	Jaya Rao	32	MALE	TRANSPORTER	D.No 68-2, Near Junction, CCS , Tirumala, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	33000.00	\N	\N	2026-07-07 13:08:33.709	2026-07-07 13:08:33.709	PENDING	ACTIVE	HIGH	\N	\N
2889	SL-EX-TPT-U-218	8	Subramanyam Kumar	subramanyam_ex-tpt-u_0	Kalyan Kumar	26	MALE	CONSUMER	D.No 69-1, Near Junction, Excise PS Tirupati Urban, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	26000.00	\N	\N	2026-07-07 13:08:34.655	2026-07-07 13:08:34.655	PENDING	ACTIVE	MEDIUM	\N	\N
2890	SL-EX-TPT-U-219	8	Lokesh Shankar	lokesh_ex-tpt-u_1	Naresh Shankar	39	MALE	INTERSTATE_LINK	D.No 69-2, Near Junction, Excise PS Tirupati Urban, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	120000.00	\N	\N	2026-07-07 13:08:35.535	2026-07-07 13:08:35.535	POSITIVE	ACTIVE	HIGH	\N	\N
2891	SL-EX-TPT-R-220	9	Naresh Naidu	naresh_ex-tpt-r_0	Gangadhar Naidu	33	FEMALE	CONSUMER	D.No 70-1, Near Junction, Excise PS Tirupati Rural, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	10000.00	\N	\N	2026-07-07 13:08:36.416	2026-07-07 13:08:36.416	POSITIVE	ACTIVE	LOW	\N	\N
2892	SL-EX-TPT-R-221	9	Ramana Sastry	ramana_ex-tpt-r_1	Kiran Sastry	46	MALE	LOCAL_PEDDLER	D.No 70-2, Near Junction, Excise PS Tirupati Rural, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	18000.00	\N	\N	2026-07-07 13:08:37.249	2026-07-07 13:08:37.249	NEGATIVE	ACTIVE	HIGH	\N	\N
2893	SL-EX-SKHT-222	10	Krishna Prasad	krishna_ex-skht_0	Ramana Prasad	40	MALE	CONSUMER	D.No 71-1, Near Junction, Excise PS SKHT, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Private Employee	14000.00	\N	\N	2026-07-07 13:08:38.122	2026-07-07 13:08:38.122	POSITIVE	ACTIVE	MEDIUM	\N	\N
2894	SL-EX-SKHT-223	10	Anand Raju	anand_ex-skht_1	Pavan Raju	53	MALE	SUPPLIER	D.No 71-2, Near Junction, Excise PS SKHT, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Business	23000.00	\N	\N	2026-07-07 13:08:39.009	2026-07-07 13:08:39.009	PENDING	ACTIVE	HIGH	\N	\N
2895	SL-EX-PTR-224	11	Mahesh Singh	mahesh_ex-ptr_0	Satish Singh	47	MALE	CONSUMER	D.No 72-1, Near Junction, Excise PS PTR, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Unemployed	18000.00	\N	\N	2026-07-07 13:08:39.9	2026-07-07 13:08:39.9	POSITIVE	ACTIVE	LOW	\N	\N
2896	SL-EX-PTR-225	11	Kiran Choudhary	kiran_ex-ptr_1	Konda Choudhary	60	MALE	LOCAL_KINGPIN	D.No 72-2, Near Junction, Excise PS PTR, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Daily Wager	90000.00	\N	\N	2026-07-07 13:08:40.703	2026-07-07 13:08:40.703	POSITIVE	ACTIVE	CRITICAL	\N	\N
2897	SL-EX-NGLP-226	12	Satish Varma	satish_ex-nglp_0	Ravi Varma	54	MALE	CONSUMER	D.No 73-1, Near Junction, Excise PS NGLP, Tirupati District	Near Bus Stop	Tirupati	Andhra Pradesh	Student	22000.00	\N	\N	2026-07-07 13:08:41.508	2026-07-07 13:08:41.508	POSITIVE	ACTIVE	MEDIUM	\N	\N
2898	SL-EX-NGLP-227	12	Raju Teja	raju_ex-nglp_1	Manoj Teja	22	MALE	TRANSPORTER	D.No 73-2, Near Junction, Excise PS NGLP, Tirupati District	Junction Area	Tirupati	Andhra Pradesh	Mechanic	33000.00	\N	\N	2026-07-07 13:08:42.402	2026-07-07 13:08:42.402	NEGATIVE	ACTIVE	MEDIUM	\N	\N
\.


--
-- Data for Name: palle_nidra_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.palle_nidra_checks (id, ps_id, officer_id, village_name, interaction_details, grievances_collected, intel_notes, no_suspicious_activity, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
2	1	4	Chandragiri	\N	\N	\N	f	13.6298234	79.4511101	\N	2026-06-14 12:46:16.983
3	1	5	Chandragiri	\N	\N	\N	f	13.5862078	79.3803340	\N	2026-06-14 12:46:19.102
4	1	7	Chandragiri	\N	\N	\N	f	13.6715179	79.4497026	\N	2026-06-14 12:46:19.715
5	8	8	Chandragiri	\N	\N	\N	f	13.6617183	79.3954549	\N	2026-06-14 12:46:20.327
6	42	33	Chandragiri	\N	\N	\N	f	13.6699842	79.4092139	\N	2026-06-14 12:46:20.94
\.


--
-- Data for Name: petty_cases_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.petty_cases_checks (id, ps_id, officer_id, accused_name, petty_case_no, act_section, fine_amount, location, no_suspicious_activity, remarks, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
2	1	4	Kiran	\N	Sec 290 IPC	\N	\N	f	\N	13.6259075	79.4502866	\N	2026-06-14 12:46:18.201
3	1	5	Kiran	\N	Sec 290 IPC	\N	\N	f	\N	13.6072739	79.4542928	\N	2026-06-14 12:46:19.389
4	1	7	Kiran	\N	Sec 290 IPC	\N	\N	f	\N	13.6213517	79.4038238	\N	2026-06-14 12:46:20.001
5	8	8	Kiran	\N	Sec 290 IPC	\N	\N	f	\N	13.6008542	79.4227046	\N	2026-06-14 12:46:20.605
6	42	33	Kiran	\N	Sec 290 IPC	\N	\N	f	\N	13.6047580	79.4502091	\N	2026-06-14 12:46:21.225
\.


--
-- Data for Name: police_stations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.police_stations (id, name, district, state, ps_code, station_type, created_at, sdpo) FROM stdin;
45	Puttur UPS	Tirupati	Andhra Pradesh	TPT-026	POLICE	2026-06-09 06:54:42.176	Puttur SDPO
6	Alipiri	Tirupati	Andhra Pradesh	ALP	POLICE	2026-06-03 11:28:44.232	Tirupati SDPO
1	Tirupathi East	Tirupati	Andhra Pradesh	TP-EAST	POLICE	2026-06-03 11:28:43.81	Tirupati SDPO
7	Sri City UPS	Tirupati	Andhra Pradesh	SRC	POLICE	2026-06-03 11:28:44.302	Sri City SDPO
67	Tirupati Traffic	Tirupati	Andhra Pradesh	TPT-048	POLICE	2026-06-09 06:54:43.692	Tirupati Traffic
68	Tirumala Traffic	Tirupati	Andhra Pradesh	TPT-049	POLICE	2026-06-09 06:54:43.761	Tirumala Traffic
71	Mahila UPS Tirupati	Tirupati	Andhra Pradesh	TPT-052	POLICE	2026-06-09 06:54:43.969	Mahila UPS Tirupati
13	Excise PS CGR	Tirupati	Andhra Pradesh	EX-CGR	EXCISE	2026-06-03 11:28:44.72	\N
14	Excise PS TML	Tirupati	Andhra Pradesh	EX-TML	EXCISE	2026-06-03 11:28:44.791	\N
15	Excise PS GDR	Tirupati	Andhra Pradesh	EX-GDR	EXCISE	2026-06-03 11:28:44.861	\N
16	Excise PS NDP	Tirupati	Andhra Pradesh	EX-NDP	EXCISE	2026-06-03 11:28:44.931	\N
17	Excise PS SLPT	Tirupati	Andhra Pradesh	EX-SLPT	EXCISE	2026-06-03 11:28:45.001	\N
18	Excise PS VKD	Tirupati	Andhra Pradesh	EX-VKD	EXCISE	2026-06-03 11:28:45.07	\N
19	Excise PS VGR	Tirupati	Andhra Pradesh	EX-VGR	EXCISE	2026-06-03 11:28:45.139	\N
20	Naidupeta UPS	Tirupati	Andhra Pradesh	TPT-001	POLICE	2026-06-09 06:54:40.36	Naidupet SDPO
21	Doravari Satram	Tirupati	Andhra Pradesh	TPT-002	POLICE	2026-06-09 06:54:40.519	Naidupet SDPO
22	Ozili	Tirupati	Andhra Pradesh	TPT-003	POLICE	2026-06-09 06:54:40.589	Naidupet SDPO
23	Pellakur	Tirupati	Andhra Pradesh	TPT-004	POLICE	2026-06-09 06:54:40.657	Naidupet SDPO
24	Sriharikota	Tirupati	Andhra Pradesh	TPT-005	POLICE	2026-06-09 06:54:40.725	Naidupet SDPO
25	Sullurpet	Tirupati	Andhra Pradesh	TPT-006	POLICE	2026-06-09 06:54:40.794	Naidupet SDPO
26	Tada	Tirupati	Andhra Pradesh	TPT-007	POLICE	2026-06-09 06:54:40.863	Naidupet SDPO
27	Balayapalli	Tirupati	Andhra Pradesh	TPT-008	POLICE	2026-06-09 06:54:40.932	Naidupet SDPO
28	Venkatagiri	Tirupati	Andhra Pradesh	TPT-009	POLICE	2026-06-09 06:54:41	Naidupet SDPO
29	Dakkili	Tirupati	Andhra Pradesh	TPT-010	POLICE	2026-06-09 06:54:41.07	Naidupet SDPO
30	Chittamuru	Tirupati	Andhra Pradesh	TPT-011	POLICE	2026-06-09 06:54:41.139	Naidupet SDPO
31	Vakadu	Tirupati	Andhra Pradesh	TPT-012	POLICE	2026-06-09 06:54:41.21	Naidupet SDPO
32	Srikalahasthi I Town	Tirupati	Andhra Pradesh	TPT-013	POLICE	2026-06-09 06:54:41.279	Srikalahasti SDPO
33	Srikalahasti II Town	Tirupati	Andhra Pradesh	TPT-014	POLICE	2026-06-09 06:54:41.347	Srikalahasti SDPO
34	Srikalahasthi Rural	Tirupati	Andhra Pradesh	TPT-015	POLICE	2026-06-09 06:54:41.415	Srikalahasti SDPO
35	BN Kandriga	Tirupati	Andhra Pradesh	TPT-016	POLICE	2026-06-09 06:54:41.483	Srikalahasti SDPO
36	Thotambedu	Tirupati	Andhra Pradesh	TPT-017	POLICE	2026-06-09 06:54:41.551	Srikalahasti SDPO
4	Renigunta UPS	Tirupati	Andhra Pradesh	RGT	POLICE	2026-06-03 11:28:44.092	Renigunta SDPO
38	Yerpedu UPS	Tirupati	Andhra Pradesh	TPT-019	POLICE	2026-06-09 06:54:41.699	Renigunta SDPO
39	Chitvel	Tirupati	Andhra Pradesh	TPT-020	POLICE	2026-06-09 06:54:41.767	Renigunta SDPO
40	Obulavaripalli	Tirupati	Andhra Pradesh	TPT-021	POLICE	2026-06-09 06:54:41.835	Renigunta SDPO
41	Penagalur	Tirupati	Andhra Pradesh	TPT-022	POLICE	2026-06-09 06:54:41.903	Renigunta SDPO
42	Pullampeta	Tirupati	Andhra Pradesh	TPT-023	POLICE	2026-06-09 06:54:41.973	Renigunta SDPO
43	Airport	Tirupati	Andhra Pradesh	TPT-024	POLICE	2026-06-09 06:54:42.041	Renigunta SDPO
44	Gajulamandyam	Tirupati	Andhra Pradesh	TPT-025	POLICE	2026-06-09 06:54:42.108	Renigunta SDPO
46	Narayanavanam	Tirupati	Andhra Pradesh	TPT-027	POLICE	2026-06-09 06:54:42.245	Puttur SDPO
47	Pitchatoor	Tirupati	Andhra Pradesh	TPT-028	POLICE	2026-06-09 06:54:42.312	Puttur SDPO
48	K.V.B.Puram	Tirupati	Andhra Pradesh	TPT-029	POLICE	2026-06-09 06:54:42.381	Puttur SDPO
49	Vadamalpet	Tirupati	Andhra Pradesh	TPT-030	POLICE	2026-06-09 06:54:42.45	Puttur SDPO
50	Nagalapuram	Tirupati	Andhra Pradesh	TPT-031	POLICE	2026-06-09 06:54:42.519	Puttur SDPO
51	Satyavedu	Tirupati	Andhra Pradesh	TPT-032	POLICE	2026-06-09 06:54:42.588	Puttur SDPO
52	Vardaiahpalem	Tirupati	Andhra Pradesh	TPT-033	POLICE	2026-06-09 06:54:42.657	Puttur SDPO
3	Tirchanur UPS	Tirupati	Andhra Pradesh	TCR	POLICE	2026-06-03 11:28:44.022	Chandragiri SDPO
54	Tirupati Rural UPS	Tirupati	Andhra Pradesh	TPT-035	POLICE	2026-06-09 06:54:42.796	Chandragiri SDPO
5	Chandragiri UPS	Tirupati	Andhra Pradesh	CGR-PS	POLICE	2026-06-03 11:28:44.162	Chandragiri SDPO
56	RC Puram	Tirupati	Andhra Pradesh	TPT-037	POLICE	2026-06-09 06:54:42.934	Chandragiri SDPO
57	Pakala UPS	Tirupati	Andhra Pradesh	TPT-038	POLICE	2026-06-09 06:54:43.002	Chandragiri SDPO
58	Bhakarapet	Tirupati	Andhra Pradesh	TPT-039	POLICE	2026-06-09 06:54:43.07	Chandragiri SDPO
59	Yerravaripalem	Tirupati	Andhra Pradesh	TPT-040	POLICE	2026-06-09 06:54:43.142	Chandragiri SDPO
2	Tirupathi West	Tirupati	Andhra Pradesh	TP-WEST	POLICE	2026-06-03 11:28:43.952	Tirupati SDPO
63	S.V.U.Campus	Tirupati	Andhra Pradesh	TPT-044	POLICE	2026-06-09 06:54:43.415	Tirupati SDPO
64	Tirumala I Town	Tirupati	Andhra Pradesh	TPT-045	POLICE	2026-06-09 06:54:43.484	Tirumala SDPO
65	Tirumala II Town	Tirupati	Andhra Pradesh	TPT-046	POLICE	2026-06-09 06:54:43.552	Tirumala SDPO
69	CCS , Tirupathi	Tirupati	Andhra Pradesh	TPT-050	POLICE	2026-06-09 06:54:43.83	CCS , Tirupathi
70	CCS , Tirumala	Tirupati	Andhra Pradesh	TPT-051	POLICE	2026-06-09 06:54:43.9	CCS , Tirumala
8	Excise PS Tirupati Urban	Tirupati	Andhra Pradesh	EX-TPT-U	EXCISE	2026-06-03 11:28:44.372	\N
9	Excise PS Tirupati Rural	Tirupati	Andhra Pradesh	EX-TPT-R	EXCISE	2026-06-03 11:28:44.441	\N
10	Excise PS SKHT	Tirupati	Andhra Pradesh	EX-SKHT	EXCISE	2026-06-03 11:28:44.511	\N
11	Excise PS PTR	Tirupati	Andhra Pradesh	EX-PTR	EXCISE	2026-06-03 11:28:44.582	\N
12	Excise PS NGLP	Tirupati	Andhra Pradesh	EX-NGLP	EXCISE	2026-06-03 11:28:44.651	\N
\.


--
-- Data for Name: railway_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.railway_checks (id, ps_id, officer_id, station_name, trains_checked, passengers_profiled, luggage_inspected_count, suspicious_luggage_found, no_suspicious_activity, findings_notes, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
1	1	4	Tirupati Main	\N	45	\N	f	f	\N	13.6222259	79.4351206	\N	2026-06-14 12:46:17.793
2	1	5	Tirupati Main	\N	45	\N	f	f	\N	13.6187580	79.4408167	\N	2026-06-14 12:46:19.291
3	1	7	Tirupati Main	\N	45	\N	f	f	\N	13.6242788	79.4545322	\N	2026-06-14 12:46:19.904
4	8	8	Tirupati Main	\N	45	\N	f	f	\N	13.5878721	79.4074478	\N	2026-06-14 12:46:20.509
5	42	33	Tirupati Main	\N	45	\N	f	f	\N	13.5965014	79.4126256	\N	2026-06-14 12:46:21.128
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, user_id, token, expiry_date, revoked, created_at) FROM stdin;
1	1	48a54632d967af7f7f782279301fa90e340f1e4720ccb6ed12fc7f8d99e82960e514a886ae282c78	2026-06-10 11:31:35.323	t	2026-06-03 11:31:35.327
2	1	6e134920615cd6b3cc6501f6b405a4c20640306c1bfea0dfbfb273d5a881539ad69b6033cfa6e963	2026-06-10 11:54:53.319	t	2026-06-03 11:54:53.32
3	1	fc4b61eb84b7229def76a1574c70c90b3ce0a0f2ba3401e7e5fb86799791c87c1534c41fb7ac107b	2026-06-10 12:04:44.912	t	2026-06-03 12:04:44.913
4	1	f8e6ac226b72c9b199f590dd1e27e0714cfd7c3543521c3bca3b820679022e9430565583165553de	2026-06-10 12:18:56.952	t	2026-06-03 12:18:56.953
5	1	c9ef1ea32a457bc1f9df635d28957c13fb47db8624e76b270e82a6afa85c2fa899e8f1c74c9899f6	2026-06-11 02:54:33.163	t	2026-06-04 02:54:33.164
6	4	da88fed5e8a99ecb0bda71440ffc2c71ea704c0795fa3db0febdef5b8fd79c82831e511638ff4da2	2026-06-11 02:56:26.535	t	2026-06-04 02:56:26.536
7	1	820caddba3442ad8416539de314f6d7895a86fb7b7ab8dfd63fe6fb8b1cbff866a08117167723468	2026-06-11 03:39:30.523	t	2026-06-04 03:39:30.524
8	4	0f0f44ea95c1bb2c403a41518403cb9841e8ff1948c70408832a4c2cbdf462479506ac7059e9d23e	2026-06-11 03:40:27.337	t	2026-06-04 03:40:27.338
9	1	091bd00cbb93cc7ffdc37ef567dafa0136fbc54eadc612f8219468aa3a35a17ceed06004b103645b	2026-06-11 03:40:47.472	t	2026-06-04 03:40:47.472
10	1	2c010be9ea5c5fcce64beb7ffc8aafa2b3325ef5d05eacb264698e78ef5c000614fd3cdece376ccf	2026-06-11 03:45:40.87	t	2026-06-04 03:45:40.871
11	4	b1177e1a78f3e0fbee3e680bede551fffd881a46089c92011f657147e4e7c9573bb64eaf9ece90ed	2026-06-11 08:57:29.866	t	2026-06-04 08:57:29.867
12	1	4286e8f10a3b96148c2af383f546f8b2b909d7ebd2f350edbc9a56d5c15fcc1b878b7af8272ca2f1	2026-06-11 08:58:18.139	t	2026-06-04 08:58:18.14
13	1	f0f37bb974f595987e535b8be73df2076685c10b6db7ea82bc0c55c1f27afdc80e76e0a66d42c26c	2026-06-11 09:25:51.319	t	2026-06-04 09:25:51.32
14	1	e6531f3ceda11e734dc093fab8531f2d0f7e5da2acedb9107002b29de4f8ffb0d4ccb03ec7ead5af	2026-06-11 10:12:17.625	t	2026-06-04 10:12:17.626
15	4	4f55cc49d1b9124d5ee7bcfb2e99894e2fa1ec1417b70bcf4e040b94500cc287c9745823e7e3cb63	2026-06-11 10:56:51.78	t	2026-06-04 10:56:51.781
16	1	ce87bbc53f97e2467de66eafcaa95435bdabcdae454a944897bf1d1cdf0c0c9b75f5b4a396e8eb37	2026-06-11 11:23:30.658	t	2026-06-04 11:23:30.659
17	1	897e6ba4a6bc07b2231c3210160ef1e7bb5e564f06e25ee935602c46e8fc6d54126da1e1fe0d9ece	2026-06-12 12:42:56.08	t	2026-06-05 12:42:56.082
18	1	19cb930599c8c103cbaf40ff644e068a3a8a49c450d3b58987d649ade316e47cdf96f9277dbfbdc9	2026-06-13 03:12:42.262	t	2026-06-06 03:12:42.263
19	1	a9549539ddecc129293bb28498bbdd1fbae8275a5dc1be1e10f93a785d35e3de007f46df64f5c6f0	2026-06-13 03:59:07.174	t	2026-06-06 03:59:07.175
20	1	c1d19ee25c0320facb433a2603500809e66815aac414291726190414f20b8cbbda8615bd36a1ba07	2026-06-13 05:46:10.325	t	2026-06-06 05:46:10.326
21	1	434dd45b77859edadfc9d7de23f2f751e949d9cb229453e1b9c3c047fc75306c5c329e2721267a0d	2026-06-13 06:02:07.866	t	2026-06-06 06:02:07.87
22	4	df91532521a6a731f0111c0d9e92589e505eabdc8d8832b4a8fa16f140cae916272fb20bd51b6347	2026-06-13 06:08:51.429	t	2026-06-06 06:08:51.43
23	1	21b6e8ab9567820b1baa308f0af0c3d59e1450922200b8f9223d21f67bc89b572c73960b5ac43481	2026-06-13 06:09:49.482	t	2026-06-06 06:09:49.491
24	1	0ed4a5fd4ce1004efa955fc8201dadb1ad4f6be520c2e871ea06fc976bf9e4792efb5d78c853e65b	2026-06-13 07:15:30.349	t	2026-06-06 07:15:30.355
25	1	34def756923d166b94094847e90e0de50577acd8e7b6fb5a2d96f39cccccafe158c4b6046921af66	2026-06-13 07:37:55.767	t	2026-06-06 07:37:55.768
26	4	78c67c38143d2b8ff5abdf32765b0bdce1516df255102dfcb55190800319fea0c8b85ba97d0afbca	2026-06-13 07:47:25.109	t	2026-06-06 07:47:25.11
27	1	e14956bb266ec5441309b107a0613a41747c8e00a2a7de134a9300c0f9ab56efa4a00c38d01a2765	2026-06-13 07:52:05.276	t	2026-06-06 07:52:05.278
29	1	be10365c33db01d233e7787791d6737ccc2ce6dc17a75e664f573c261d439b7264c68b6f462adfc4	2026-06-16 02:56:30.26	t	2026-06-09 02:56:30.261
30	1	56f6273114dda76172c51508a27f9ab4f7f3bca7ebaec46ec5fe6ba92b0145c72ae6f6e956f3e210	2026-06-16 02:58:43.63	t	2026-06-09 02:58:43.631
28	4	3f81ab9067fba0f07c4d0956a0c9624e40a9976a32162fc2c2191c3583ba2bf6515345b09c2f0235	2026-06-13 07:55:24.956	t	2026-06-06 07:55:24.957
31	4	52cf281933774a7dc60bb7095684eb2d4c28895c45229edb8beb4ad0b23c77fc8a3b0dd0afceded9	2026-06-16 03:17:06.416	t	2026-06-09 03:17:06.418
33	1	8fa50c23c0fdcbe7f103959000cffe74027bd7a8ffe40752d0dee6f5c22912f30f5a8d77d18b56f4	2026-06-16 03:44:14.41	t	2026-06-09 03:44:14.411
32	4	9e2fe1798fe02b476db6da1897379cf1a47d7b3b630b5c93248217329dd2d8c11f2525cea05e618a	2026-06-16 03:43:41.31	t	2026-06-09 03:43:41.312
34	4	0b7bb60ff8e4e55ca2fad01f4c0bbb15be14050148e001cd1f2285dfcd75c18c6e8833f7f2e419f7	2026-06-16 05:13:11.821	t	2026-06-09 05:13:11.822
35	1	1fd74d66c5f4bf489a4af8fc96dcab423ccf83f6eaa38853ee67e03fa98e747a918cee92ac60804d	2026-06-16 05:13:40.793	t	2026-06-09 05:13:40.795
36	1	7cb2b1b7cb65dd0638a0bd07e49dfc00685eec6b3f98ab6b58a9615116049b6e2f3ce37072b1325b	2026-06-16 05:14:32.163	t	2026-06-09 05:14:32.164
37	1	df789b39743e866cfa2fa4f26fc20cf1dfe124618702c545528e42cc15ac5fe6d5db5a467b186f86	2026-06-16 05:16:32.756	t	2026-06-09 05:16:32.757
38	4	bf050f239fe48744f211206f85f19cc915029aa925a5fb9d8623bd0783b67198597f7b456f45812f	2026-06-16 05:27:45.654	t	2026-06-09 05:27:45.655
39	4	8300ca09284a6b6778be2273c860211fc16304f7170352ceab21afdadc26609131f25c9b32e24b2b	2026-06-16 05:33:08.686	t	2026-06-09 05:33:08.687
40	1	f3382c9b33864b8e32203f152a9cbb11211bd1a5524cd7f420cb8fa5b4b3c8f3ec3c7cc0bd01ff33	2026-06-16 05:45:59.286	t	2026-06-09 05:45:59.287
42	4	d7632f597e38f081086e4bd73333b5e8294a569e69eb6a5b546a970c8f145df4af4d37642eef920b	2026-06-16 07:42:08.214	t	2026-06-09 07:42:08.215
41	1	7125963b6df59a9c9154175ed21d138fc85071022c65898963a5e165c01fed460eebd157426f63ae	2026-06-16 06:55:59.76	t	2026-06-09 06:55:59.762
43	1	710e8569926cc08ecb082bad7511a9e9d69e331b56f2481b405e7215c96a69e0c013231104c601be	2026-06-17 06:00:02.163	t	2026-06-10 06:00:02.165
44	1	9e3ba689a979af20a7db1f4c3a614683b96f75fb0a7c28641b7ecaeb8f252983a5221fc03466aa08	2026-06-17 14:00:19.167	t	2026-06-10 14:00:19.168
45	1	9512f34d9cff49825e959b765e59206851e4f28ed2716b89b897934ad9be2f5642ceb680fface1bb	2026-06-17 14:19:16.966	t	2026-06-10 14:19:16.967
46	4	c41e87f0f60b4dad0d980db2c2d4c813a16ed1aa67433680f390d9023152b7d0c4bb8e9efaa60a39	2026-06-17 14:22:53.121	t	2026-06-10 14:22:53.122
47	1	97c6c9b6be00fb287ec9ced2db54c9ca095874457d79e21f8cb1220491f4e750457a11de0b23d294	2026-06-17 14:23:27.004	f	2026-06-10 14:23:27.005
48	1	035451954d78eb097e40eed545bbcbc37c26be4afe1b35fbcedd7e1b3046af1009585421cf7385e3	2026-06-19 12:23:30.917	f	2026-06-12 12:23:30.919
49	1	8a314715cb770df604da8a6be38aee75c2e3b054d5ece7d83ccea96ca53df2801f01fef2fbadcc7b	2026-06-19 12:37:39.181	f	2026-06-12 12:37:39.182
50	4	f06f5b638b12160d42a695a5257d70aba00ded7723e1e7e554a90c03ea6d1175d1832b3b693e06a0	2026-06-19 13:08:30.187	f	2026-06-12 13:08:30.189
51	1	08c6b4043398e56baa886170134a8e7285f5b022dac0c8d131cee7a1d8e3194f9246a17d24030e9c	2026-06-19 13:12:54.169	f	2026-06-12 13:12:54.171
52	1	834e8bc4b1685c519c9523eb49e4d065ad0e96b28bd23bbf3b3f23cff957355588417271ccac8ccc	2026-06-19 13:33:34.375	f	2026-06-12 13:33:34.377
53	1	b948352eb451d0f97c5a8fd1342f7a35f31ad05d90ca830bf17018f8de95cb0f12ee577c0f53a5a8	2026-06-19 13:38:26.973	f	2026-06-12 13:38:26.975
54	1	c25e1684a20bcbe56773700989455ed73b11f60e6aa540b7b75a8c3011d2d97b9bc0c5bbe5328a42	2026-06-19 13:43:43.109	f	2026-06-12 13:43:43.11
55	1	a20e769c858233ab4db4fdb9a73a02d1700931f32ee9709d4d83a637356d34af93a51ccf2656ec72	2026-06-19 13:50:01.034	f	2026-06-12 13:50:01.035
56	1	a0a69ceac405165fc1d46c2d307924e6c44fbde217a4b7935ee2a3b2089ac54f2a40b41be3c9db7b	2026-06-19 13:51:17.653	f	2026-06-12 13:51:17.655
57	1	41867fcaba360c199ced97c09e668e342de004fc15f69a69bdb836ac958a85ee40ff848baf33d369	2026-06-19 13:51:29.703	f	2026-06-12 13:51:29.704
58	1	6bbd3e9819f01bfe99bbc80e456231e80c92cfd5699898fbddcdcd9d280f959ca57a3cbd0a1f4984	2026-06-19 14:52:22.117	f	2026-06-12 14:52:22.118
59	1	b66be0bd740280b37f06dd4a25628cd1ef951394310fcd8797842b67aea27b11a992f20335200a00	2026-06-19 15:01:48.135	f	2026-06-12 15:01:48.136
60	1	d2a3b6b82f32f3446b9d7da5c6991006a019532122af25cbc1215003bc959b1d98ab2704cdcc7a06	2026-06-20 13:40:44.814	f	2026-06-13 13:40:44.815
61	1	4f8b2b7a2344dacd99d51d86b4a156126b33b5168634b674f3c20a69f68d9dac1d96f313a9435cf5	2026-06-20 13:51:58.815	f	2026-06-13 13:51:58.827
62	4	3cf686ddcbd8a726f2231e5679b4d5d3fe90fcf3a3abdbbaafa4419d2079a12136b5c6542b5a543a	2026-06-20 15:29:48.927	f	2026-06-13 15:29:48.929
63	1	eb0977e566cab34275449c07841ff162c81e481876c8683f277868abea25f35ea578335a31c1e1ef	2026-06-20 15:40:56.473	t	2026-06-13 15:40:56.475
64	4	0606820fec89b17c2dcc174fe6181843357db6a332830c55556c91bc50472c9cf7034650dcb501bf	2026-06-20 16:04:52.303	t	2026-06-13 16:04:52.304
65	1	f4a9f99261e3eb7fd01304b04430fa05b22398e9d1b4cdcc4739a23a94ea551fa9d78140dffc8db8	2026-06-20 16:05:01.521	t	2026-06-13 16:05:01.522
66	1	2c12e51ae83ff8dcdd71f7211baefacfc4b2e23a669257c9798333121817726efcd56c64652dae11	2026-06-21 11:12:31.755	t	2026-06-14 11:12:31.76
67	4	861ae2e61b3b9b1c3fa1a0815d9a91c570cbd38154cf222453bc8d5a0542622a34e20fcbbcd763bb	2026-06-21 12:38:26.65	t	2026-06-14 12:38:26.654
68	1	0dd51c1b512740e0ed04662d8949fd1c609db1f8918727800a1f1b6bc9ae9868cd031ed57cba8444	2026-06-21 12:39:59.816	t	2026-06-14 12:39:59.818
69	1	c94575a2825a5240744a808998640c22a7dd4ba699e0678f38ff645ad68df3c6d54e1d63d281085d	2026-06-25 05:04:04.91	t	2026-06-18 05:04:04.914
70	1	ccc50fd1e154834e0c058b4424cb8f666b4a64c1752923c7544f09571076e945e2bc5dcbb18dc8f2	2026-06-28 06:28:03.234	t	2026-06-21 06:28:03.238
73	1	7d3d181680144c1db16b25b92f5a32543e84d90c143f56683cda87de25d2496147e9725856e90d9c	2026-06-30 16:07:22.768	t	2026-06-23 16:07:22.771
78	1	f77eada28f69f97fe8d2605b28c9df2a12ae6d33932218d8b1bf0817ef82fbc41a388edea2c99bc7	2026-07-02 08:32:46.498	t	2026-06-25 08:32:46.501
79	1	4bc54394e197708e017c47b8457dc8a8c2a8d008b47476a68325abbd93841a4d1edbcfe0a96f09b9	2026-07-02 08:49:58.31	t	2026-06-25 08:49:58.311
80	1	25598be6302d2d5b2eefb0f5a38779c17320ad336ae2dfc925215af668a06a655e80a2619a1db851	2026-07-02 10:30:44.547	t	2026-06-25 10:30:44.548
82	4	474abb27570b3d8bc8745fdd813b7fd4d8687b5e659ce2234efb13e533006052a834e5862eef9f84	2026-07-02 11:37:19.906	t	2026-06-25 11:37:19.908
83	1	7046c2045c759a6adc40bff042801088995214d13baf8b9266426e508b341f7919c89773ad83ce47	2026-07-02 11:46:54.641	t	2026-06-25 11:46:54.643
81	1	b72e43978db14ff6fe4c94fafd4fa8381bed5bce0738c3b37f2c729de8583c4d6c40ebd0627f2b5d	2026-07-02 11:14:47.714	t	2026-06-25 11:14:47.715
87	1	c8026859a569fbe5f43fb5b6c9afe13868647148ae6bc797fbe22d273e07c93afc28d95e6a153985	2026-07-02 12:47:43.073	f	2026-06-25 12:47:43.074
88	1	fdf60ef90b9aa19d8d56f05d5daee04a374f1bf022b4e76dec878d8018a1c89cde438a5c5ee5e251	2026-07-02 14:18:29.183	t	2026-06-25 14:18:29.184
89	4	9e7d62e2905b0bf27482da4855e424dcd61b36a9b12825c0ee9cf712d9aa4bd1b9aa64713a97a3b3	2026-07-02 14:32:20.234	t	2026-06-25 14:32:20.235
90	3	06cba96e75b2a3f7b292e3eccea5787e8fa7b0a605077e5e6585cc1d889bbae6b4b25c02dac573fa	2026-07-02 14:33:13.879	t	2026-06-25 14:33:13.88
94	3	511258826da74ac924fc7a8e8a3fc2ef7b7730642595ffb07b06265bc75991cedab37ed66b161c7f	2026-07-02 15:30:12.281	f	2026-06-25 15:30:12.282
91	1	8b00976bdf24c86ee3db675fde6d7ea02ed34997f8eac46b17ab1af5e706af94200242fa5f2e1218	2026-07-02 15:17:36.986	t	2026-06-25 15:17:36.987
92	1	99400861ebfd76083d3d8e78d5c884992f3ad5d752b7e57d7c0dc5e48150d450f9d7cb554f423cec	2026-07-02 15:17:38.058	t	2026-06-25 15:17:38.06
95	1	456b62740d18ac70568318c7a5748284c0418a52eedb47cc275868b4d7813e9b19f8c82937a66cfc	2026-07-03 04:46:51.275	f	2026-06-26 04:46:51.276
96	1	4feccdd11043b07d2c69da388ee5f970d8ed2e3f12606acc5a19148c17480c4998211a67f978a443	2026-07-03 04:53:04.939	t	2026-06-26 04:53:04.94
101	1	a83c2b8e8e0f96ef603343c38648e8530650e2c0e129157c1951a3509edea1796fab546c41e5db2a	2026-07-03 09:42:56.335	f	2026-06-26 09:42:56.337
100	1	7cb5757a66c3335399e0fab8877bf1c2c01d1a0f8f0adc7164ddb48b6b7cbd3bb154366ea97d5a23	2026-07-03 05:40:09.892	t	2026-06-26 05:40:09.893
102	1	c781af5b99a57e7eb7617d217612e7d25be5af6e8cecd2e64b7e28f5e47c3969f396c4a532eb57b7	2026-07-03 09:43:08.41	t	2026-06-26 09:43:08.411
98	1	c51254062b562c92007837b319174aafb39a9317a6bf0c98c9830ed30eb71d20bbab96492d6ee7aa	2026-07-03 05:09:33.939	t	2026-06-26 05:09:33.943
103	7	16eb73801c726e9fd31fa3b6aa4e2475987d411c2f22e10776359316cad4b3fccc010f24042358e3	2026-07-06 05:16:16.753	f	2026-06-29 05:16:16.754
104	7	3964929abf8437b0a400b73409d8fecb808ada2abe846cfc2a45196d323916b533de4d0fac6dfe42	2026-07-06 05:32:34.408	t	2026-06-29 05:32:34.409
105	1	5705178187874ee6e8310640bf24f461695550186505b07aae70b74fac4416b2c59ab76b78865ff8	2026-07-06 07:00:46.709	t	2026-06-29 07:00:46.711
106	7	c5ba818abadef5db4a3a7dbb82eaee8517441d0eacb4fc6742729be78bcc34565fcf9c1cb898f7d9	2026-07-06 07:01:04.518	f	2026-06-29 07:01:04.52
107	1	fd9b1246f4c084de7c179029fc78a7a7d5cd42ee1dad8c1a73e3ebd492aea23be10979858228d2d5	2026-07-06 08:26:41.549	f	2026-06-29 08:26:41.552
108	1	595ec644c01ffc8b27275eb8f426be9ff567379cec592564e1cd96539d3bee17934029b02a2cf955	2026-07-06 08:26:45.917	f	2026-06-29 08:26:45.919
109	7	8dd16e64747cc77f0b605fb8d08716bbcaaa0d1ca391113507bb69c7a11a904ce08f3abd6df45dbe	2026-07-06 08:31:22.903	t	2026-06-29 08:31:22.906
110	4	dfbc74bffdad27d069899f91ec4c1093b7193e0ba4963d814a48d5fbb092142ceff6efdfb9a2b366	2026-07-06 08:44:52.179	t	2026-06-29 08:44:52.18
111	1	9277b1959bf418817836f6caa8d6d1c9736016060f0af3eae64e5e2f743575534306f947cbd21180	2026-07-06 08:45:12.379	t	2026-06-29 08:45:12.381
112	7	a4a007541b29d517958fed758c6d50bd762b7644f5e6fcb0a7a0c45d5fc397f7e3eed31117a8ba35	2026-07-06 08:48:14.677	t	2026-06-29 08:48:14.679
113	7	15350adf164d16004bfa9d7c50b4b92eece81e4194334c20f91b1ba05ecd82b1fc1ef627d256ac02	2026-07-06 12:44:57.075	t	2026-06-29 12:44:57.076
114	1	c089110056c2cc92f0de618f79f308a16751ae6438d8a09e9c980c9387f8a50cd8ebab6d5aaa2923	2026-07-06 13:34:52.117	t	2026-06-29 13:34:52.118
116	3	34b53777841c2389a6184e2df280cca660b842ed86d7e697e66e4a9cbccbe448a24a29f544487910	2026-07-06 16:16:32.401	f	2026-06-29 16:16:32.402
115	7	60dbf360b105ba121a030682be14b7e6788ab3ec198ff7e858cb97b34be0ea357931c85cdf55aaee	2026-07-06 13:39:13.542	t	2026-06-29 13:39:13.544
117	7	7b54e1661b16ceb2a9f1cdc127735c6c0a5118277e08180136f0d5ceebd2fb91defacafc8900f1c9	2026-07-07 11:41:41.354	f	2026-06-30 11:41:41.356
118	7	6af873a3c113e1465c17a21aaea2d4b6ed9659022a2bff22c8f1ef9c503aa806a4300138fae88caf	2026-07-08 08:27:57.398	t	2026-07-01 08:27:57.399
119	7	573a1f144f079bfe55a3ff80c84338515854e5f598d040b98c76beebe5ee10fcf7204a8c2f616974	2026-07-08 10:45:47.441	t	2026-07-01 10:45:47.442
122	2	92ba801f47a9809d7505faa147bcb894853c22687d9f63ab9dfe75872533e106891bf018c98ab43c	2026-07-08 12:01:10.128	t	2026-07-01 12:01:10.13
124	1	0ada96813580cb756706443846f3cf320eb62b6eb78bc16b46a3eb9d5b000e47d0d678d647e12d07	2026-07-08 12:02:12.006	f	2026-07-01 12:02:12.008
125	1	cf5245bafa58822a93c04079e35fd334f9bb1ac91fbefccbdaf938ac350494ec7cb2ae5889bd2f55	2026-07-08 12:02:41.64	f	2026-07-01 12:02:41.641
126	1	e61e53b0e9827c5db4af5504f6c4926f5c46c2e9518d260824ca66f3a5be1bdb678c01d7cf745a82	2026-07-08 12:02:52.453	f	2026-07-01 12:02:52.454
127	1	60c9d0104b4d6552ceb9820d74683c7d6dceeeb7f502d7a764af283c2a5b176283d944cc4108990f	2026-07-08 12:03:20.122	f	2026-07-01 12:03:20.124
128	2	69ec458ab6453245596069b5f4fef815a801d4136dbea35d2a37973b7d3c9530ed24065f4755ac98	2026-07-08 12:03:20.492	f	2026-07-01 12:03:20.493
129	3	c4ea93231840179f276c1fc4c408345a8f19a317f54d06a31311e67dbc8fd121aad7e70baf6209e9	2026-07-08 12:03:20.854	f	2026-07-01 12:03:20.856
130	4	c1aca03484674abd669200139883e890843dac658e791174af8a4af15f1884017a84aad5441c5ae3	2026-07-08 12:03:21.211	f	2026-07-01 12:03:21.212
131	6	a0dccba7cb99022b7eff79ebc453a069a8e72de78770ea61c38a155aea9bebb1deda693de9cd7de5	2026-07-08 12:03:21.573	f	2026-07-01 12:03:21.575
132	8	51e78e2b666c72a3eed935be60674b1835e8341ddc97e2d27b9d57997fe28c81162a8bf8f0903132	2026-07-08 12:03:21.942	f	2026-07-01 12:03:21.943
133	1	7ae946f439df79129a747ca2faad00c62656221f443b646bb85abaa5554c2e328a87bc700b8ed298	2026-07-08 12:04:14.349	f	2026-07-01 12:04:14.351
134	2	e5325552491ac7dbc4bf244dadf8050c7abec41e32a6965707de1139afffd054e4cccfb77722dac2	2026-07-08 12:04:14.832	f	2026-07-01 12:04:14.834
135	3	21ec073f3040a4fd6a0c63b3aa3e1474d6b38abf24b0c58743a29fb2bdd59ff69b046800976e9fd9	2026-07-08 12:04:15.181	f	2026-07-01 12:04:15.183
136	4	4923e18ed529e8ca971b8a095cc3afc99420fa83eecfcabf29de74c009949550ee5bcbb85bff31f2	2026-07-08 12:04:15.52	f	2026-07-01 12:04:15.522
137	6	79124a63ae543ce2318393c5e486340d2b5e9bf1a8f0031cd24def1e7088022e79d55d132b7b04f2	2026-07-08 12:04:15.857	f	2026-07-01 12:04:15.859
138	8	d383b94afebe1fde93ec6b1d08a7ea651fc185802950f0d84461ca092b9603ffd0d385aac6ea295f	2026-07-08 12:04:16.194	f	2026-07-01 12:04:16.196
123	7	9c3027e16902e4b70ab48cfc03beb78b8f102867efb5aabf8b152ab31e5aec95492e132ea7c45380	2026-07-08 12:01:18.323	t	2026-07-01 12:01:18.325
140	7	bc5dbdcd1e9a2161fc09ea5bdbf5393595252a2fef773e934b6e87046f1fe50b0c61ada8b4243401	2026-07-13 06:09:55.454	f	2026-07-06 06:09:55.455
139	7	baa3fffdb47487d6af2619dda4c0f3eae122ac89a17cb7559a87285a8ccb04f60ca756a4177c80b9	2026-07-08 12:46:27.024	t	2026-07-01 12:46:27.026
141	1	55af6ec8d04991c9c018fa1579bc05547f8944f8fc12034a168d7e77c2e10d1d0f89c50a6cda8c3a	2026-07-14 07:38:54.872	t	2026-07-07 07:38:54.874
142	7	cd7338fee4d36075458763f7fb771f559b81c6c8b40dacb821d608a0ca4241269bc72b57d1ad8941	2026-07-14 07:41:48.104	t	2026-07-07 07:41:48.106
145	4	27ad4c20b97d7e5814fd6ea9896a8a6e80d013aa323fb6aab5c1f1bb6ca921a836c16cf0b76b8957	2026-07-14 08:10:24.9	t	2026-07-07 08:10:24.901
143	1	680b312a9e4debd7deeb346cb74ac31a0d95ae382824cfa0599183802bad46343b6b181abd2f4387	2026-07-14 07:55:16.356	t	2026-07-07 07:55:16.357
146	7	1440329ca214a5b13705acb632d266e41dd561cd2d261415d4f69bfb4a52d6e7a4a3bf76626e5872	2026-07-14 11:08:11.807	f	2026-07-07 11:08:11.809
144	1	4e96d69ad61f20f32e8ef1328470733847646ecb4f8b6db38027034a229080b3b205686a2f2633a5	2026-07-14 08:04:02.76	t	2026-07-07 08:04:02.761
147	1	f4e623320af7471aa09cab72dacd8114270c0e0df9a859f052bff45cf6242244fd486849d76df7cf	2026-07-15 05:31:20.4	t	2026-07-08 05:31:20.401
148	7	b58717d6ff6bc0973eece4f82ee9ca863036152d266e78951ab6356f650c6afb251dc63c98ad8761	2026-07-15 06:31:05.12	t	2026-07-08 06:31:05.122
149	4	cb864e57e054c2671a71ec841fe0360c46d17d70046f6f7107b5bf119c880dc6d7df3f1ca67d81ef	2026-07-15 06:33:43.406	t	2026-07-08 06:33:43.408
150	1	1c99b339897d6beb5b616219f9fb93bc5d0fae0ebb0b16901724dfce3b1b29425b6335b376a2d9ac	2026-07-15 06:37:59.233	t	2026-07-08 06:37:59.234
151	6	e5ecc5f1f201ccf8532838b2e337b4cf6c9023bc7cf796f5cc3bc5c67ea8552e483c1297cf3ac743	2026-07-15 06:42:24.822	t	2026-07-08 06:42:24.824
152	1	1c5fe3a7791f29b7567347f634db945757a26292b23abe7d93767b80ebb903873838397c4a24fac6	2026-07-15 06:52:06.045	f	2026-07-08 06:52:06.047
153	1	c14b5f7a7f7408f3f2600e8a5e622cc71583b342699525c219f485ac0100ec346839d1fa39e6c417	2026-07-15 08:14:23.369	t	2026-07-08 08:14:23.37
154	7	fc463eb14dd6bfba7f18026335f1460c46b3438f26425546dd56867a4a76fd42666587a54907e646	2026-07-15 08:57:39.174	t	2026-07-08 08:57:39.176
155	1	c6f14ae967a263e96ca481f129badf78ef5e05daec52772be9420fa18a80903835225de1bc14f856	2026-07-15 09:29:54.872	f	2026-07-08 09:29:54.874
\.


--
-- Data for Name: rowdy_sheeter_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rowdy_sheeter_checks (id, ps_id, officer_id, rowdy_sheeter_name, rowdy_sheet_no, activity_status, verification_notes, associates_noted, current_employment, no_suspicious_activity, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
2	1	4	Ramu	RS-123	\N	\N	\N	\N	f	13.6557819	79.3707050	\N	2026-06-14 12:46:17.179
3	1	5	Ramu	RS-123	\N	\N	\N	\N	f	13.6401221	79.3925209	\N	2026-06-14 12:46:19.148
4	1	7	Ramu	RS-123	\N	\N	\N	\N	f	13.6464524	79.4583272	\N	2026-06-14 12:46:19.763
5	8	8	Ramu	RS-123	\N	\N	\N	\N	f	13.6043602	79.3884344	\N	2026-06-14 12:46:20.372
6	42	33	Ramu	RS-123	\N	\N	\N	\N	f	13.6059093	79.3897865	\N	2026-06-14 12:46:20.987
\.


--
-- Data for Name: seized_vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seized_vehicles (id, case_id, seizure_id, vehicle_type, registration_no, make_model, color, chassis_no, engine_no, owner_name, owner_address, seizure_location, seizure_date, current_status, court_order_no, remarks, created_at) FROM stdin;
\.


--
-- Data for Name: seizures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seizures (id, case_id, contraband_kg, vehicles_count, cash_amount, parcels_count, other_items, seizure_date, created_at) FROM stdin;
1121	1600	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:06:53.863
1122	1601	1.500	1	0.00	0	\N	2026-01-11	2026-07-07 13:06:54.92
1123	1602	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:06:55.808
1124	1603	2.000	0	2000.00	0	\N	2026-02-11	2026-07-07 13:06:56.692
1125	1604	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:06:57.573
1126	1605	2.500	1	4000.00	0	\N	2026-03-11	2026-07-07 13:06:58.448
1127	1606	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:06:59.364
1128	1607	3.000	0	6000.00	0	\N	2026-04-11	2026-07-07 13:07:00.195
1129	1608	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:07:01
1130	1609	3.500	1	8000.00	0	\N	2026-05-11	2026-07-07 13:07:01.883
1131	1610	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:07:02.793
1132	1611	1.500	0	10000.00	0	\N	2026-01-11	2026-07-07 13:07:03.679
1133	1612	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:07:04.549
1134	1613	2.000	1	12000.00	0	\N	2026-02-11	2026-07-07 13:07:05.437
1135	1614	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:07:06.317
1136	1615	2.500	0	14000.00	0	\N	2026-03-11	2026-07-07 13:07:07.132
1137	1616	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:07:07.931
1138	1617	3.000	1	16000.00	0	\N	2026-04-11	2026-07-07 13:07:08.806
1139	1618	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:07:09.688
1140	1619	3.500	0	18000.00	0	\N	2026-05-11	2026-07-07 13:07:10.637
1141	1620	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:07:11.44
1142	1621	1.500	1	20000.00	0	\N	2026-01-11	2026-07-07 13:07:12.257
1143	1622	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:07:13.13
1144	1623	2.000	0	22000.00	0	\N	2026-02-11	2026-07-07 13:07:14.003
1145	1624	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:07:14.882
1146	1625	2.500	1	24000.00	0	\N	2026-03-11	2026-07-07 13:07:15.764
1147	1626	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:07:16.584
1148	1627	3.000	0	26000.00	0	\N	2026-04-11	2026-07-07 13:07:17.394
1149	1628	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:07:18.211
1150	1629	3.500	1	28000.00	0	\N	2026-05-11	2026-07-07 13:07:19.105
1151	1630	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:07:19.935
1152	1631	1.500	0	30000.00	0	\N	2026-01-11	2026-07-07 13:07:20.744
1153	1632	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:07:21.56
1154	1633	2.000	1	32000.00	0	\N	2026-02-11	2026-07-07 13:07:22.442
1155	1634	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:07:23.333
1156	1635	2.500	0	34000.00	0	\N	2026-03-11	2026-07-07 13:07:24.208
1157	1636	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:07:25.104
1158	1637	3.000	1	36000.00	0	\N	2026-04-11	2026-07-07 13:07:26.042
1159	1638	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:07:26.92
1160	1639	3.500	0	38000.00	0	\N	2026-05-11	2026-07-07 13:07:27.725
1161	1640	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:07:28.615
1162	1641	1.500	1	40000.00	0	\N	2026-01-11	2026-07-07 13:07:29.498
1163	1642	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:07:30.31
1164	1643	2.000	0	42000.00	0	\N	2026-02-11	2026-07-07 13:07:31.181
1165	1644	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:07:32.001
1166	1645	2.500	1	44000.00	0	\N	2026-03-11	2026-07-07 13:07:32.897
1167	1646	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:07:33.713
1168	1647	3.000	0	46000.00	0	\N	2026-04-11	2026-07-07 13:07:34.53
1169	1648	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:07:35.417
1170	1649	3.500	1	48000.00	0	\N	2026-05-11	2026-07-07 13:07:36.29
1171	1650	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:07:37.163
1172	1651	1.500	0	50000.00	0	\N	2026-01-11	2026-07-07 13:07:37.969
1173	1652	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:07:38.779
1174	1653	2.000	1	52000.00	0	\N	2026-02-11	2026-07-07 13:07:39.665
1175	1654	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:07:40.464
1176	1655	2.500	0	54000.00	0	\N	2026-03-11	2026-07-07 13:07:41.393
1177	1656	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:07:42.207
1178	1657	3.000	1	56000.00	0	\N	2026-04-11	2026-07-07 13:07:43.069
1179	1658	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:07:43.939
1180	1659	3.500	0	58000.00	0	\N	2026-05-11	2026-07-07 13:07:44.676
1181	1660	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:07:45.489
1182	1661	1.500	1	60000.00	0	\N	2026-01-11	2026-07-07 13:07:46.289
1183	1662	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:07:47.166
1184	1663	2.000	0	62000.00	0	\N	2026-02-11	2026-07-07 13:07:48.022
1185	1664	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:07:48.887
1186	1665	2.500	1	64000.00	0	\N	2026-03-11	2026-07-07 13:07:49.748
1187	1666	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:07:50.558
1188	1667	3.000	0	66000.00	0	\N	2026-04-11	2026-07-07 13:07:51.428
1189	1668	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:07:52.233
1190	1669	3.500	1	68000.00	0	\N	2026-05-11	2026-07-07 13:07:53.097
1191	1670	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:07:53.834
1192	1671	1.500	0	70000.00	0	\N	2026-01-11	2026-07-07 13:07:54.699
1193	1672	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:07:55.555
1194	1673	2.000	1	72000.00	0	\N	2026-02-11	2026-07-07 13:07:56.348
1195	1674	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:07:57.275
1196	1675	2.500	0	74000.00	0	\N	2026-03-11	2026-07-07 13:07:58.137
1197	1676	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:07:58.941
1198	1677	3.000	1	76000.00	0	\N	2026-04-11	2026-07-07 13:07:59.827
1199	1678	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:08:00.713
1200	1679	3.500	0	78000.00	0	\N	2026-05-11	2026-07-07 13:08:01.53
1201	1680	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:08:02.349
1202	1681	1.500	1	80000.00	0	\N	2026-01-11	2026-07-07 13:08:03.181
1203	1682	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:08:04.055
1204	1683	2.000	0	82000.00	0	\N	2026-02-11	2026-07-07 13:08:04.923
1205	1684	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:08:05.8
1206	1685	2.500	1	84000.00	0	\N	2026-03-11	2026-07-07 13:08:06.679
1207	1686	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:08:07.553
1208	1687	3.000	0	86000.00	0	\N	2026-04-11	2026-07-07 13:08:08.428
1209	1688	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:08:09.241
1210	1689	3.500	1	88000.00	0	\N	2026-05-11	2026-07-07 13:08:10.361
1211	1690	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:08:11.293
1212	1691	1.500	0	90000.00	0	\N	2026-01-11	2026-07-07 13:08:12.228
1213	1692	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:08:13.099
1214	1693	2.000	1	92000.00	0	\N	2026-02-11	2026-07-07 13:08:13.941
1215	1694	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:08:14.831
1216	1695	2.500	0	94000.00	0	\N	2026-03-11	2026-07-07 13:08:15.63
1217	1696	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:08:16.439
1218	1697	3.000	1	96000.00	0	\N	2026-04-11	2026-07-07 13:08:17.261
1219	1698	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:08:18.137
1220	1699	3.500	0	98000.00	0	\N	2026-05-11	2026-07-07 13:08:18.949
1221	1700	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:08:19.831
1222	1701	1.500	1	100000.00	0	\N	2026-01-11	2026-07-07 13:08:20.782
1223	1702	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:08:21.59
1224	1703	2.000	0	102000.00	0	\N	2026-02-11	2026-07-07 13:08:22.469
1225	1704	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:08:23.355
1226	1705	2.500	1	104000.00	0	\N	2026-03-11	2026-07-07 13:08:24.151
1227	1706	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:08:25.011
1228	1707	3.000	0	106000.00	0	\N	2026-04-11	2026-07-07 13:08:25.903
1229	1708	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:08:26.758
1230	1709	3.500	1	108000.00	0	\N	2026-05-11	2026-07-07 13:08:27.566
1231	1710	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:08:28.458
1232	1711	1.500	0	110000.00	0	\N	2026-01-11	2026-07-07 13:08:29.208
1233	1712	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:08:30.09
1234	1713	2.000	1	112000.00	0	\N	2026-02-11	2026-07-07 13:08:30.971
1235	1714	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:08:31.803
1236	1715	2.500	0	114000.00	0	\N	2026-03-11	2026-07-07 13:08:32.68
1237	1716	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:08:33.573
1238	1717	3.000	1	116000.00	0	\N	2026-04-11	2026-07-07 13:08:34.512
1239	1718	0.130	0	0.00	0	\N	2026-05-10	2026-07-07 13:08:35.395
1240	1719	3.500	0	118000.00	0	\N	2026-05-11	2026-07-07 13:08:36.277
1241	1720	0.050	0	0.00	0	\N	2026-01-10	2026-07-07 13:08:37.104
1242	1721	1.500	1	120000.00	0	\N	2026-01-11	2026-07-07 13:08:37.986
1243	1722	0.070	0	0.00	0	\N	2026-02-10	2026-07-07 13:08:38.869
1244	1723	2.000	0	122000.00	0	\N	2026-02-11	2026-07-07 13:08:39.765
1245	1724	0.090	0	0.00	0	\N	2026-03-10	2026-07-07 13:08:40.556
1246	1725	2.500	1	124000.00	0	\N	2026-03-11	2026-07-07 13:08:41.371
1247	1726	0.110	0	0.00	0	\N	2026-04-10	2026-07-07 13:08:42.267
1248	1727	3.000	0	126000.00	0	\N	2026-04-11	2026-07-07 13:08:43.153
\.


--
-- Data for Name: social_media_intel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.social_media_intel (id, offender_id, platform, handle_or_url, rating, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: supply_chain_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supply_chain_links (id, offender_id, link_type, linked_person_name, linked_person_contact, linked_offender_id, notes, created_at) FROM stdin;
508	2771	PEDDLER	\N	\N	2772	Buys small quantities regularly from group A	2026-07-07 13:08:43.631
509	2771	PEDDLER	\N	\N	2774	Also sources from group B when group A is dry	2026-07-07 13:08:43.631
510	2778	KINGPIN	\N	\N	2776	Transports for the kingpin	2026-07-07 13:08:43.901
511	2774	TRANSPORTER	\N	\N	2778	Receives bulk shipments	2026-07-07 13:08:43.901
512	2772	SUPPLIER	\N	\N	2774	Gets stock from supplier	2026-07-07 13:08:43.901
513	2866	KINGPIN	\N	\N	2860	Random intelligence connection	2026-07-07 13:08:44.169
514	2834	SUPPLIER	\N	\N	2838	Random intelligence connection	2026-07-07 13:08:44.299
515	2818	KINGPIN	\N	\N	2778	Random intelligence connection	2026-07-07 13:08:44.366
516	2852	PEDDLER	\N	\N	2855	Random intelligence connection	2026-07-07 13:08:44.433
517	2800	SUPPLIER	\N	\N	2787	Random intelligence connection	2026-07-07 13:08:44.5
518	2792	PEDDLER	\N	\N	2865	Random intelligence connection	2026-07-07 13:08:44.567
519	2789	SUPPLIER	\N	\N	2878	Random intelligence connection	2026-07-07 13:08:44.636
520	2771	TRANSPORTER	\N	\N	2875	Random intelligence connection	2026-07-07 13:08:44.706
521	2878	SUPPLIER	\N	\N	2808	Random intelligence connection	2026-07-07 13:08:44.774
522	2802	CO_CONSUMER	\N	\N	2861	Random intelligence connection	2026-07-07 13:08:44.841
523	2781	TRANSPORTER	\N	\N	2793	Random intelligence connection	2026-07-07 13:08:44.909
524	2773	KINGPIN	\N	\N	2893	Random intelligence connection	2026-07-07 13:08:44.977
525	2887	KINGPIN	\N	\N	2879	Random intelligence connection	2026-07-07 13:08:45.045
526	2880	TRANSPORTER	\N	\N	2832	Random intelligence connection	2026-07-07 13:08:45.112
527	2806	KINGPIN	\N	\N	2881	Random intelligence connection	2026-07-07 13:08:45.181
\.


--
-- Data for Name: surveillance_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.surveillance_records (id, offender_id, scheduled_date, verified_by, verification_status, current_address, current_occupation, associates_noted, geo_lat, geo_lng, notes, created_at) FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (key, value, updated_at) FROM stdin;
CHARGE_SHEET_DUE_DAYS_COMMERCIAL	180	2026-07-01 11:01:38.296
ABSCONDER_ALERT_THRESHOLD_DAYS	45	2026-07-01 11:01:38.296
CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL	60	2026-07-01 11:01:38.296
COURT_HEARING_REMINDER_DAYS	2	2026-07-01 11:01:38.296
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teams (id, name, department, description, is_active, created_at, updated_at) FROM stdin;
1	Narcotics Task Force	POLICE	Primary field operations for NDPS cases	t	2026-06-03 11:28:45.209	2026-06-03 11:28:45.209
2	Cyber Surveillance Unit	CYBER_ANALYTICS	Technical surveillance, IMEI, CDR analysis & network mapping	t	2026-06-03 11:28:45.756	2026-06-03 11:28:45.756
4	Excise Enforcement Unit	EXCISE	Excise department enforcement operations	t	2026-06-23 14:26:29.867	2026-06-23 14:26:29.867
\.


--
-- Data for Name: tower_match_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tower_match_logs (id, case_id, mobile_number, latitude, longitude, hit_time, cell_tower_id, provider, created_at) FROM stdin;
\.


--
-- Data for Name: transaction_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transaction_records (id, batch_id, offender_id, bank_name, account_no, upi_id, transaction_ref, amount, txn_date, direction, txn_mode, counterparty_name, counterparty_account, narration, balance_after, is_flagged, flag_reason, matched_offender_id, notes, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password_hash, full_name, role, department, badge_number, police_station_id, division_id, team_id, is_active, last_login, failed_login_count, locked_until, password_changed_at, created_at, district) FROM stdin;
5	constable	$2b$10$DJNWgwUodDd21Q6CIc/5.eVRVhPslCBz7uTA970oQi6vrTtnn/.XK	B. Krishna (Constable)	CONSTABLE	POLICE	\N	1	\N	1	t	\N	0	\N	\N	2026-06-03 11:28:48.216	\N
33	tpt-023_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Pullampeta SHO	SHO	POLICE	\N	42	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:23.559	\N
34	tpt-023_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Pullampeta Constable	CONSTABLE	POLICE	\N	42	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:23.714	\N
35	tpt-038_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Pakala UPS SHO	SHO	POLICE	\N	57	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:23.787	\N
36	tpt-038_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Pakala UPS Constable	CONSTABLE	POLICE	\N	57	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:23.861	\N
37	tpt-039_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Bhakarapet SHO	SHO	POLICE	\N	58	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:23.933	\N
38	tpt-039_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Bhakarapet Constable	CONSTABLE	POLICE	\N	58	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.006	\N
39	tpt-044_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	S.V.U.Campus SHO	SHO	POLICE	\N	63	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.079	\N
40	tpt-044_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	S.V.U.Campus Constable	CONSTABLE	POLICE	\N	63	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.151	\N
41	tpt-045_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirumala I Town SHO	SHO	POLICE	\N	64	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.223	\N
42	tpt-045_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirumala I Town Constable	CONSTABLE	POLICE	\N	64	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.296	\N
43	tpt-046_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirumala II Town SHO	SHO	POLICE	\N	65	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.368	\N
44	tpt-046_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirumala II Town Constable	CONSTABLE	POLICE	\N	65	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.448	\N
45	tpt-049_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirumala Traffic SHO	SHO	POLICE	\N	68	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.521	\N
46	tpt-049_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirumala Traffic Constable	CONSTABLE	POLICE	\N	68	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.594	\N
47	ex-skht_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS SKHT SHO	SHO	EXCISE	\N	10	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.667	\N
48	ex-skht_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS SKHT Constable	CONSTABLE	EXCISE	\N	10	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.74	\N
49	ex-ptr_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS PTR SHO	SHO	EXCISE	\N	11	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.813	\N
50	ex-ptr_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS PTR Constable	CONSTABLE	EXCISE	\N	11	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.884	\N
51	ex-nglp_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS NGLP SHO	SHO	EXCISE	\N	12	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:24.958	\N
52	ex-nglp_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS NGLP Constable	CONSTABLE	EXCISE	\N	12	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.03	\N
53	ex-cgr_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS CGR SHO	SHO	EXCISE	\N	13	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.111	\N
8	excise_sho	$2b$10$NILYG8jeS8267glhv7z3/e3mhq4HiaA1NOmKueQLy5TU1Rq2KkrUm	Arjun Reddy (Excise SHO)	SHO	EXCISE	EX-001	8	\N	4	t	2026-07-01 12:04:16.127	0	\N	\N	2026-06-03 11:28:48.648	\N
1	sp	$2b$10$3k31FL690JAODyCfRAIjoeVpWmA1/w3c/lRjUplVO3OdJLfVIJ6JO	L. Subbarayudu (SP)	SP	POLICE	\N	\N	\N	\N	t	2026-07-08 09:29:54.709	0	\N	\N	2026-06-03 11:28:47.013	Tirupati
4	sho	$2b$10$Pz08sfZMYLvpWtYGD0Al.ur2ybPf7tR0SagJMr5RATQm3JSQdhJOK	M. Suresh (SHO)	SHO	POLICE	\N	1	\N	1	t	2026-07-08 06:33:43.066	0	\N	\N	2026-06-03 11:28:47.962	\N
7	cyber_sho	$2b$10$WNPjoWleytfXpjHdhZkDrufb7QkWjv8Iq8rl35PZAA2I0C5BOez/C	Ravi Kumar (Cyber SHO)	SHO	CYBER_ANALYTICS	CA-002	\N	\N	2	t	2026-07-08 08:57:39.02	0	\N	\N	2026-06-03 11:28:48.503	Tirupati
3	sdpo	$2b$10$fWDmikH.zqDzP5wD2C0X4ew/UduwxZ3PTZw/MNAgv6894pWY5kuZC	P. Venkatesh (SDPO East)	SDPO	POLICE	\N	\N	Renigunta SDPO	1	t	2026-07-01 12:04:15.113	0	\N	\N	2026-06-03 11:28:47.684	\N
54	ex-cgr_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS CGR Constable	CONSTABLE	EXCISE	\N	13	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.183	\N
55	ex-tml_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS TML SHO	SHO	EXCISE	\N	14	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.257	\N
56	ex-tml_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS TML Constable	CONSTABLE	EXCISE	\N	14	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.329	\N
57	ex-gdr_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS GDR SHO	SHO	EXCISE	\N	15	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.401	\N
58	ex-gdr_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS GDR Constable	CONSTABLE	EXCISE	\N	15	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.474	\N
59	ex-ndp_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS NDP SHO	SHO	EXCISE	\N	16	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.546	\N
60	ex-ndp_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS NDP Constable	CONSTABLE	EXCISE	\N	16	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.618	\N
61	ex-slpt_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS SLPT SHO	SHO	EXCISE	\N	17	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.691	\N
62	ex-slpt_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS SLPT Constable	CONSTABLE	EXCISE	\N	17	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.764	\N
63	ex-vkd_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS VKD SHO	SHO	EXCISE	\N	18	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.837	\N
64	ex-vkd_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS VKD Constable	CONSTABLE	EXCISE	\N	18	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.91	\N
65	ex-vgr_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS VGR SHO	SHO	EXCISE	\N	19	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:25.982	\N
66	ex-vgr_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS VGR Constable	CONSTABLE	EXCISE	\N	19	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.053	\N
67	tpt-001_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Naidupeta UPS SHO	SHO	POLICE	\N	20	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.127	\N
6	cyber_sdpo	$2b$10$/WBbHtv.0sEP5KfxmaZybuSZFGBJVDE2/thIgOtTUf.fTch1UpMGy	Vijay Singh (Cyber SDPO)	SDPO	CYBER_ANALYTICS	CA-001	\N	Tirupati SDPO	2	t	2026-07-08 06:42:24.572	0	\N	\N	2026-06-03 11:28:48.357	\N
2	asp	$2b$10$XDTrxW3ny50nlCoyfbnkmOXrB2003CuOg9hJ0fQPSwXmV3WZtQZDW	V. Srinivas Rao (ASP)	ASP	POLICE	\N	\N	\N	1	t	2026-07-01 12:04:14.761	0	\N	\N	2026-06-03 11:28:47.399	Tirupati
68	tpt-001_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Naidupeta UPS Constable	CONSTABLE	POLICE	\N	20	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.2	\N
69	tpt-002_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Doravari Satram SHO	SHO	POLICE	\N	21	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.274	\N
70	tpt-002_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Doravari Satram Constable	CONSTABLE	POLICE	\N	21	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.347	\N
71	tpt-003_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Ozili SHO	SHO	POLICE	\N	22	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.421	\N
72	tpt-003_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Ozili Constable	CONSTABLE	POLICE	\N	22	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.494	\N
73	tpt-004_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Pellakur SHO	SHO	POLICE	\N	23	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.567	\N
74	tpt-004_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Pellakur Constable	CONSTABLE	POLICE	\N	23	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.657	\N
75	tpt-005_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Sriharikota SHO	SHO	POLICE	\N	24	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.729	\N
76	tpt-005_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Sriharikota Constable	CONSTABLE	POLICE	\N	24	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.802	\N
77	tpt-006_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Sullurpet SHO	SHO	POLICE	\N	25	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.876	\N
78	tpt-006_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Sullurpet Constable	CONSTABLE	POLICE	\N	25	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:26.948	\N
79	tpt-007_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tada SHO	SHO	POLICE	\N	26	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.022	\N
80	tpt-007_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tada Constable	CONSTABLE	POLICE	\N	26	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.095	\N
81	tpt-008_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Balayapalli SHO	SHO	POLICE	\N	27	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.168	\N
82	tpt-008_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Balayapalli Constable	CONSTABLE	POLICE	\N	27	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.241	\N
83	tpt-009_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Venkatagiri SHO	SHO	POLICE	\N	28	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.314	\N
84	tpt-009_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Venkatagiri Constable	CONSTABLE	POLICE	\N	28	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.386	\N
85	tpt-010_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Dakkili SHO	SHO	POLICE	\N	29	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.46	\N
86	tpt-010_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Dakkili Constable	CONSTABLE	POLICE	\N	29	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.536	\N
87	tpt-011_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Chittamuru SHO	SHO	POLICE	\N	30	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.608	\N
88	tpt-011_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Chittamuru Constable	CONSTABLE	POLICE	\N	30	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.679	\N
89	tpt-012_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Vakadu SHO	SHO	POLICE	\N	31	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.752	\N
90	tpt-012_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Vakadu Constable	CONSTABLE	POLICE	\N	31	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.823	\N
91	tpt-013_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Srikalahasthi I Town SHO	SHO	POLICE	\N	32	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:27.897	\N
92	tpt-013_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Srikalahasthi I Town Constable	CONSTABLE	POLICE	\N	32	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.009	\N
93	tpt-014_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Srikalahasti II Town SHO	SHO	POLICE	\N	33	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.081	\N
94	tpt-014_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Srikalahasti II Town Constable	CONSTABLE	POLICE	\N	33	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.155	\N
95	tpt-015_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Srikalahasthi Rural SHO	SHO	POLICE	\N	34	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.228	\N
96	tpt-015_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Srikalahasthi Rural Constable	CONSTABLE	POLICE	\N	34	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.301	\N
97	tpt-016_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	BN Kandriga SHO	SHO	POLICE	\N	35	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.374	\N
98	tpt-016_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	BN Kandriga Constable	CONSTABLE	POLICE	\N	35	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.447	\N
99	tpt-017_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Thotambedu SHO	SHO	POLICE	\N	36	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.521	\N
100	tpt-017_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Thotambedu Constable	CONSTABLE	POLICE	\N	36	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.594	\N
101	rgt_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Renigunta UPS SHO	SHO	POLICE	\N	4	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.667	\N
102	rgt_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Renigunta UPS Constable	CONSTABLE	POLICE	\N	4	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.74	\N
103	tpt-019_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Yerpedu UPS SHO	SHO	POLICE	\N	38	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.813	\N
104	tpt-019_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Yerpedu UPS Constable	CONSTABLE	POLICE	\N	38	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.884	\N
105	tpt-020_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Chitvel SHO	SHO	POLICE	\N	39	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:28.958	\N
106	tpt-020_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Chitvel Constable	CONSTABLE	POLICE	\N	39	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.03	\N
107	tpt-021_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Obulavaripalli SHO	SHO	POLICE	\N	40	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.104	\N
108	tpt-021_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Obulavaripalli Constable	CONSTABLE	POLICE	\N	40	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.177	\N
109	tpt-022_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Penagalur SHO	SHO	POLICE	\N	41	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.25	\N
110	tpt-022_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Penagalur Constable	CONSTABLE	POLICE	\N	41	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.332	\N
111	tpt-024_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Airport SHO	SHO	POLICE	\N	43	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.406	\N
112	tpt-024_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Airport Constable	CONSTABLE	POLICE	\N	43	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.479	\N
113	tpt-025_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Gajulamandyam SHO	SHO	POLICE	\N	44	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.552	\N
114	tpt-025_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Gajulamandyam Constable	CONSTABLE	POLICE	\N	44	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.624	\N
115	tpt-026_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Puttur UPS SHO	SHO	POLICE	\N	45	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.702	\N
116	tpt-026_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Puttur UPS Constable	CONSTABLE	POLICE	\N	45	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.774	\N
117	tpt-027_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Narayanavanam SHO	SHO	POLICE	\N	46	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.847	\N
118	tpt-027_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Narayanavanam Constable	CONSTABLE	POLICE	\N	46	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.921	\N
119	tpt-028_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Pitchatoor SHO	SHO	POLICE	\N	47	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:29.993	\N
120	tpt-028_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Pitchatoor Constable	CONSTABLE	POLICE	\N	47	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.066	\N
121	tpt-029_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	K.V.B.Puram SHO	SHO	POLICE	\N	48	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.137	\N
122	tpt-029_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	K.V.B.Puram Constable	CONSTABLE	POLICE	\N	48	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.211	\N
123	tpt-030_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Vadamalpet SHO	SHO	POLICE	\N	49	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.286	\N
124	tpt-030_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Vadamalpet Constable	CONSTABLE	POLICE	\N	49	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.36	\N
125	tpt-031_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Nagalapuram SHO	SHO	POLICE	\N	50	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.432	\N
126	tpt-031_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Nagalapuram Constable	CONSTABLE	POLICE	\N	50	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.505	\N
127	tpt-032_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Satyavedu SHO	SHO	POLICE	\N	51	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.578	\N
128	tpt-032_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Satyavedu Constable	CONSTABLE	POLICE	\N	51	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.65	\N
129	tpt-033_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Vardaiahpalem SHO	SHO	POLICE	\N	52	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.722	\N
130	tpt-033_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Vardaiahpalem Constable	CONSTABLE	POLICE	\N	52	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.795	\N
131	tcr_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirchanur UPS SHO	SHO	POLICE	\N	3	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.866	\N
132	tcr_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirchanur UPS Constable	CONSTABLE	POLICE	\N	3	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:30.939	\N
133	tpt-035_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirupati Rural UPS SHO	SHO	POLICE	\N	54	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.01	\N
134	tpt-035_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirupati Rural UPS Constable	CONSTABLE	POLICE	\N	54	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.084	\N
135	cgr-ps_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Chandragiri UPS SHO	SHO	POLICE	\N	5	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.157	\N
136	cgr-ps_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Chandragiri UPS Constable	CONSTABLE	POLICE	\N	5	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.23	\N
137	tpt-037_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	RC Puram SHO	SHO	POLICE	\N	56	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.302	\N
138	tpt-037_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	RC Puram Constable	CONSTABLE	POLICE	\N	56	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.376	\N
139	tpt-040_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Yerravaripalem SHO	SHO	POLICE	\N	59	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.45	\N
140	tpt-040_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Yerravaripalem Constable	CONSTABLE	POLICE	\N	59	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.523	\N
141	alp_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Alipiri SHO	SHO	POLICE	\N	6	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.596	\N
142	alp_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Alipiri Constable	CONSTABLE	POLICE	\N	6	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.669	\N
143	tp-east_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirupathi East SHO	SHO	POLICE	\N	1	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.742	\N
144	tp-east_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirupathi East Constable	CONSTABLE	POLICE	\N	1	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.855	\N
145	tp-west_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirupathi West SHO	SHO	POLICE	\N	2	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:31.927	\N
146	tp-west_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirupathi West Constable	CONSTABLE	POLICE	\N	2	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32	\N
147	src_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Sri City UPS SHO	SHO	POLICE	\N	7	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.072	\N
148	src_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Sri City UPS Constable	CONSTABLE	POLICE	\N	7	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.146	\N
149	tpt-048_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirupati Traffic SHO	SHO	POLICE	\N	67	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.219	\N
150	tpt-048_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Tirupati Traffic Constable	CONSTABLE	POLICE	\N	67	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.292	\N
151	tpt-050_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	CCS , Tirupathi SHO	SHO	POLICE	\N	69	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.365	\N
152	tpt-050_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	CCS , Tirupathi Constable	CONSTABLE	POLICE	\N	69	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.437	\N
153	tpt-051_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	CCS , Tirumala SHO	SHO	POLICE	\N	70	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.51	\N
154	tpt-051_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	CCS , Tirumala Constable	CONSTABLE	POLICE	\N	70	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.584	\N
155	tpt-052_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Mahila UPS Tirupati SHO	SHO	POLICE	\N	71	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.656	\N
156	tpt-052_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Mahila UPS Tirupati Constable	CONSTABLE	POLICE	\N	71	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.73	\N
157	ex-tpt-u_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS Tirupati Urban SHO	SHO	EXCISE	\N	8	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.806	\N
158	ex-tpt-u_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS Tirupati Urban Constable	CONSTABLE	EXCISE	\N	8	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.88	\N
159	ex-tpt-r_sho	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS Tirupati Rural SHO	SHO	EXCISE	\N	9	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:32.953	\N
160	ex-tpt-r_const	$2b$10$4jm/87/9417um8rWP/tapeHu4xKFNJH4a42GLZ8vA9/D2prQ.njRm	Excise PS Tirupati Rural Constable	CONSTABLE	EXCISE	\N	9	\N	\N	t	\N	0	\N	\N	2026-06-10 06:16:33.027	\N
169	excise_si	$2b$10$SyQypjpWk.g.ZLQowa6/t.F4U/TqwM900JvTtr0QLzXusoeyKDPxy	Excise SI Demo	SHO	EXCISE	EX-002	8	\N	4	t	\N	0	\N	\N	2026-06-23 14:26:31.981	\N
\.


--
-- Data for Name: vehicle_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicle_checks (id, ps_id, officer_id, vehicle_no, owner_name, driver_name, driver_phone, checked_boot, suspicious_items_found, watchlist_match, no_suspicious_activity, findings_notes, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
2	1	4	AP03 CK 9876	\N	Suresh	\N	t	f	f	f	\N	13.6457603	79.4515323	\N	2026-06-14 12:46:16.562
3	1	5	AP03 CK 9876	\N	Suresh	\N	t	f	f	f	\N	13.6112283	79.3742776	\N	2026-06-14 12:46:18.918
4	1	7	AP03 CK 9876	\N	Suresh	\N	t	f	f	f	\N	13.6402780	79.4096796	\N	2026-06-14 12:46:19.622
5	8	8	AP03 CK 9876	\N	Suresh	\N	t	f	f	f	\N	13.6384562	79.4529775	\N	2026-06-14 12:46:20.233
6	42	33	AP03 CK 9876	\N	Suresh	\N	t	f	f	f	\N	13.6397870	79.3731833	\N	2026-06-14 12:46:20.846
\.


--
-- Data for Name: village_visits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.village_visits (id, ps_id, officer_id, village_name, visit_date, verified_bad_chars, verified_rowdies, verified_bound_overs, verified_habitual, interacted_elders, intel_collected, drug_peddler_check, drone_surveillance, vehicle_checking, palle_nidra, no_suspicious_activity, intel_notes, geo_lat, geo_lng, photo_url, created_at) FROM stdin;
1	1	4	Tiruchanoor	2026-06-14 12:46:15.964	f	f	f	f	f	f	f	f	f	f	f	\N	13.6299729	79.4610008	\N	2026-06-14 12:46:15.964
2	1	5	Tiruchanoor	2026-06-14 12:46:18.612	f	f	f	f	f	f	f	f	f	f	f	\N	13.6591513	79.3922366	\N	2026-06-14 12:46:18.612
3	1	7	Tiruchanoor	2026-06-14 12:46:19.483	f	f	f	f	f	f	f	f	f	f	f	\N	13.6630347	79.3843006	\N	2026-06-14 12:46:19.483
4	8	8	Tiruchanoor	2026-06-14 12:46:20.096	f	f	f	f	f	f	f	f	f	f	f	\N	13.6218300	79.4287755	\N	2026-06-14 12:46:20.096
5	42	33	Tiruchanoor	2026-06-14 12:46:20.708	f	f	f	f	f	f	f	f	f	f	f	\N	13.6783410	79.4483779	\N	2026-06-14 12:46:20.708
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 341, true);


--
-- Name: bail_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bail_records_id_seq', 1, false);


--
-- Name: bound_over_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bound_over_checks_id_seq', 6, true);


--
-- Name: bus_stand_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bus_stand_checks_id_seq', 5, true);


--
-- Name: case_accused_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.case_accused_id_seq', 2941, true);


--
-- Name: cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cases_id_seq', 1728, true);


--
-- Name: charge_sheets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.charge_sheets_id_seq', 1, false);


--
-- Name: courier_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.courier_checks_id_seq', 5, true);


--
-- Name: court_hearings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.court_hearings_id_seq', 1, false);


--
-- Name: deletion_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.deletion_requests_id_seq', 1, false);


--
-- Name: districts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.districts_id_seq', 1, false);


--
-- Name: divisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.divisions_id_seq', 8, true);


--
-- Name: drone_surveillance_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.drone_surveillance_checks_id_seq', 6, true);


--
-- Name: drunk_drive_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.drunk_drive_checks_id_seq', 5, true);


--
-- Name: edit_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.edit_requests_id_seq', 1, false);


--
-- Name: enforcement_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.enforcement_checks_id_seq', 23, true);


--
-- Name: finance_upload_batches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.finance_upload_batches_id_seq', 1, false);


--
-- Name: imei_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.imei_records_id_seq', 1, false);


--
-- Name: informers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.informers_id_seq', 10, true);


--
-- Name: intelligence_inputs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.intelligence_inputs_id_seq', 1, false);


--
-- Name: interrogation_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.interrogation_sessions_id_seq', 1, false);


--
-- Name: lodge_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lodge_checks_id_seq', 6, true);


--
-- Name: messaging_intel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messaging_intel_id_seq', 1, false);


--
-- Name: mv_act_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mv_act_checks_id_seq', 6, true);


--
-- Name: offender_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.offender_contacts_id_seq', 3744, true);


--
-- Name: offender_drug_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.offender_drug_profile_id_seq', 2901, true);


--
-- Name: offender_financials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.offender_financials_id_seq', 2492, true);


--
-- Name: offender_identity_docs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.offender_identity_docs_id_seq', 1249, true);


--
-- Name: offenders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.offenders_id_seq', 2898, true);


--
-- Name: palle_nidra_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.palle_nidra_checks_id_seq', 6, true);


--
-- Name: petty_cases_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.petty_cases_checks_id_seq', 6, true);


--
-- Name: police_stations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.police_stations_id_seq', 403, true);


--
-- Name: railway_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.railway_checks_id_seq', 5, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 155, true);


--
-- Name: rowdy_sheeter_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rowdy_sheeter_checks_id_seq', 6, true);


--
-- Name: seized_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seized_vehicles_id_seq', 6, true);


--
-- Name: seizures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seizures_id_seq', 1248, true);


--
-- Name: social_media_intel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.social_media_intel_id_seq', 1, false);


--
-- Name: supply_chain_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supply_chain_links_id_seq', 527, true);


--
-- Name: surveillance_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.surveillance_records_id_seq', 9, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.teams_id_seq', 4, true);


--
-- Name: tower_match_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tower_match_logs_id_seq', 1, false);


--
-- Name: transaction_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transaction_records_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 199, true);


--
-- Name: vehicle_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vehicle_checks_id_seq', 6, true);


--
-- Name: village_visits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.village_visits_id_seq', 5, true);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bail_records bail_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bail_records
    ADD CONSTRAINT bail_records_pkey PRIMARY KEY (id);


--
-- Name: bound_over_checks bound_over_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bound_over_checks
    ADD CONSTRAINT bound_over_checks_pkey PRIMARY KEY (id);


--
-- Name: bus_stand_checks bus_stand_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_stand_checks
    ADD CONSTRAINT bus_stand_checks_pkey PRIMARY KEY (id);


--
-- Name: case_accused case_accused_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_accused
    ADD CONSTRAINT case_accused_pkey PRIMARY KEY (id);


--
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);


--
-- Name: charge_sheets charge_sheets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.charge_sheets
    ADD CONSTRAINT charge_sheets_pkey PRIMARY KEY (id);


--
-- Name: courier_checks courier_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courier_checks
    ADD CONSTRAINT courier_checks_pkey PRIMARY KEY (id);


--
-- Name: court_hearings court_hearings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.court_hearings
    ADD CONSTRAINT court_hearings_pkey PRIMARY KEY (id);


--
-- Name: deletion_requests deletion_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deletion_requests
    ADD CONSTRAINT deletion_requests_pkey PRIMARY KEY (id);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: divisions divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (id);


--
-- Name: drone_surveillance_checks drone_surveillance_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drone_surveillance_checks
    ADD CONSTRAINT drone_surveillance_checks_pkey PRIMARY KEY (id);


--
-- Name: drunk_drive_checks drunk_drive_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drunk_drive_checks
    ADD CONSTRAINT drunk_drive_checks_pkey PRIMARY KEY (id);


--
-- Name: edit_requests edit_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edit_requests
    ADD CONSTRAINT edit_requests_pkey PRIMARY KEY (id);


--
-- Name: enforcement_checks enforcement_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_checks
    ADD CONSTRAINT enforcement_checks_pkey PRIMARY KEY (id);


--
-- Name: finance_upload_batches finance_upload_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_upload_batches
    ADD CONSTRAINT finance_upload_batches_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: imei_records imei_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imei_records
    ADD CONSTRAINT imei_records_pkey PRIMARY KEY (id);


--
-- Name: informers informers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.informers
    ADD CONSTRAINT informers_pkey PRIMARY KEY (id);


--
-- Name: intelligence_inputs intelligence_inputs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_inputs
    ADD CONSTRAINT intelligence_inputs_pkey PRIMARY KEY (id);


--
-- Name: interrogation_sessions interrogation_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interrogation_sessions
    ADD CONSTRAINT interrogation_sessions_pkey PRIMARY KEY (id);


--
-- Name: lodge_checks lodge_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lodge_checks
    ADD CONSTRAINT lodge_checks_pkey PRIMARY KEY (id);


--
-- Name: messaging_intel messaging_intel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messaging_intel
    ADD CONSTRAINT messaging_intel_pkey PRIMARY KEY (id);


--
-- Name: mv_act_checks mv_act_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mv_act_checks
    ADD CONSTRAINT mv_act_checks_pkey PRIMARY KEY (id);


--
-- Name: offender_contacts offender_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_contacts
    ADD CONSTRAINT offender_contacts_pkey PRIMARY KEY (id);


--
-- Name: offender_drug_profile offender_drug_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_drug_profile
    ADD CONSTRAINT offender_drug_profile_pkey PRIMARY KEY (id);


--
-- Name: offender_financials offender_financials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_financials
    ADD CONSTRAINT offender_financials_pkey PRIMARY KEY (id);


--
-- Name: offender_identity_docs offender_identity_docs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_identity_docs
    ADD CONSTRAINT offender_identity_docs_pkey PRIMARY KEY (id);


--
-- Name: offenders offenders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offenders
    ADD CONSTRAINT offenders_pkey PRIMARY KEY (id);


--
-- Name: palle_nidra_checks palle_nidra_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.palle_nidra_checks
    ADD CONSTRAINT palle_nidra_checks_pkey PRIMARY KEY (id);


--
-- Name: petty_cases_checks petty_cases_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.petty_cases_checks
    ADD CONSTRAINT petty_cases_checks_pkey PRIMARY KEY (id);


--
-- Name: police_stations police_stations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.police_stations
    ADD CONSTRAINT police_stations_pkey PRIMARY KEY (id);


--
-- Name: railway_checks railway_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.railway_checks
    ADD CONSTRAINT railway_checks_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: rowdy_sheeter_checks rowdy_sheeter_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rowdy_sheeter_checks
    ADD CONSTRAINT rowdy_sheeter_checks_pkey PRIMARY KEY (id);


--
-- Name: seized_vehicles seized_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seized_vehicles
    ADD CONSTRAINT seized_vehicles_pkey PRIMARY KEY (id);


--
-- Name: seizures seizures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seizures
    ADD CONSTRAINT seizures_pkey PRIMARY KEY (id);


--
-- Name: social_media_intel social_media_intel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_intel
    ADD CONSTRAINT social_media_intel_pkey PRIMARY KEY (id);


--
-- Name: supply_chain_links supply_chain_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_chain_links
    ADD CONSTRAINT supply_chain_links_pkey PRIMARY KEY (id);


--
-- Name: surveillance_records surveillance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveillance_records
    ADD CONSTRAINT surveillance_records_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (key);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: tower_match_logs tower_match_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tower_match_logs
    ADD CONSTRAINT tower_match_logs_pkey PRIMARY KEY (id);


--
-- Name: transaction_records transaction_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_records
    ADD CONSTRAINT transaction_records_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicle_checks vehicle_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_checks
    ADD CONSTRAINT vehicle_checks_pkey PRIMARY KEY (id);


--
-- Name: village_visits village_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.village_visits
    ADD CONSTRAINT village_visits_pkey PRIMARY KEY (id);


--
-- Name: case_accused_case_id_offender_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX case_accused_case_id_offender_id_key ON public.case_accused USING btree (case_id, offender_id);


--
-- Name: charge_sheets_case_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX charge_sheets_case_id_key ON public.charge_sheets USING btree (case_id);


--
-- Name: districts_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX districts_name_key ON public.districts USING btree (name);


--
-- Name: divisions_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX divisions_code_key ON public.divisions USING btree (code);


--
-- Name: divisions_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX divisions_name_key ON public.divisions USING btree (name);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_audit_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_audit_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_timestamp ON public.audit_logs USING btree ("timestamp");


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_bc_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bc_date ON public.bus_stand_checks USING btree (created_at);


--
-- Name: idx_bc_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bc_officer ON public.bus_stand_checks USING btree (officer_id);


--
-- Name: idx_bc_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bc_ps ON public.bus_stand_checks USING btree (ps_id);


--
-- Name: idx_bo_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bo_date ON public.bound_over_checks USING btree (created_at);


--
-- Name: idx_bo_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bo_officer ON public.bound_over_checks USING btree (officer_id);


--
-- Name: idx_bo_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bo_ps ON public.bound_over_checks USING btree (ps_id);


--
-- Name: idx_br_case; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_br_case ON public.bail_records USING btree (case_id);


--
-- Name: idx_ca_case; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ca_case ON public.case_accused USING btree (case_id);


--
-- Name: idx_ca_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ca_offender ON public.case_accused USING btree (offender_id);


--
-- Name: idx_cases_contraband; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cases_contraband ON public.cases USING btree (contraband_type);


--
-- Name: idx_cases_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cases_date ON public.cases USING btree (case_date);


--
-- Name: idx_cases_fir; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cases_fir ON public.cases USING btree (fir_no);


--
-- Name: idx_cases_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cases_ps ON public.cases USING btree (ps_id);


--
-- Name: idx_cases_stage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cases_stage ON public.cases USING btree (stage);


--
-- Name: idx_cc_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_date ON public.courier_checks USING btree (created_at);


--
-- Name: idx_cc_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_officer ON public.courier_checks USING btree (officer_id);


--
-- Name: idx_cc_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_ps ON public.courier_checks USING btree (ps_id);


--
-- Name: idx_ch_case; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ch_case ON public.court_hearings USING btree (case_id);


--
-- Name: idx_ch_next; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ch_next ON public.court_hearings USING btree (next_hearing_date);


--
-- Name: idx_cs_case; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cs_case ON public.charge_sheets USING btree (case_id);


--
-- Name: idx_dd_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dd_date ON public.drunk_drive_checks USING btree (created_at);


--
-- Name: idx_dd_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dd_officer ON public.drunk_drive_checks USING btree (officer_id);


--
-- Name: idx_dd_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dd_ps ON public.drunk_drive_checks USING btree (ps_id);


--
-- Name: idx_div_district; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_div_district ON public.divisions USING btree (district);


--
-- Name: idx_dr_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dr_entity ON public.deletion_requests USING btree (entity_type, entity_id);


--
-- Name: idx_dr_flagged_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dr_flagged_by ON public.deletion_requests USING btree (flagged_by);


--
-- Name: idx_dr_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dr_status ON public.deletion_requests USING btree (status);


--
-- Name: idx_ds_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ds_date ON public.drone_surveillance_checks USING btree (created_at);


--
-- Name: idx_ds_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ds_officer ON public.drone_surveillance_checks USING btree (officer_id);


--
-- Name: idx_ds_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ds_ps ON public.drone_surveillance_checks USING btree (ps_id);


--
-- Name: idx_ec_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ec_created_at ON public.enforcement_checks USING btree (created_at);


--
-- Name: idx_ec_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ec_created_by ON public.enforcement_checks USING btree (created_by);


--
-- Name: idx_ec_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ec_ps ON public.enforcement_checks USING btree (ps_id);


--
-- Name: idx_ec_result; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ec_result ON public.enforcement_checks USING btree (test_result);


--
-- Name: idx_ec_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ec_status ON public.enforcement_checks USING btree (status);


--
-- Name: idx_er_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_er_entity ON public.edit_requests USING btree (entity_type, entity_id);


--
-- Name: idx_er_requested_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_er_requested_by ON public.edit_requests USING btree (requested_by);


--
-- Name: idx_er_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_er_status ON public.edit_requests USING btree (status);


--
-- Name: idx_fub_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fub_month ON public.finance_upload_batches USING btree (statement_month);


--
-- Name: idx_fub_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fub_offender ON public.finance_upload_batches USING btree (offender_id);


--
-- Name: idx_fub_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fub_status ON public.finance_upload_batches USING btree (status);


--
-- Name: idx_fub_uploader; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fub_uploader ON public.finance_upload_batches USING btree (uploaded_by);


--
-- Name: idx_ii_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ii_created_by ON public.intelligence_inputs USING btree (created_by);


--
-- Name: idx_ii_informer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ii_informer ON public.intelligence_inputs USING btree (informer_id);


--
-- Name: idx_ii_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ii_offender ON public.intelligence_inputs USING btree (offender_id);


--
-- Name: idx_ii_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ii_ps ON public.intelligence_inputs USING btree (ps_id);


--
-- Name: idx_ii_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ii_source ON public.intelligence_inputs USING btree (source_type);


--
-- Name: idx_imei_mobile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_imei_mobile ON public.imei_records USING btree (mobile_number);


--
-- Name: idx_imei_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_imei_number ON public.imei_records USING btree (imei_number);


--
-- Name: idx_imei_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_imei_offender ON public.imei_records USING btree (offender_id);


--
-- Name: idx_inf_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inf_created_by ON public.informers USING btree (created_by);


--
-- Name: idx_inf_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inf_status ON public.informers USING btree (status);


--
-- Name: idx_is_case; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_is_case ON public.interrogation_sessions USING btree (case_id);


--
-- Name: idx_is_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_is_offender ON public.interrogation_sessions USING btree (offender_id);


--
-- Name: idx_lc_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lc_date ON public.lodge_checks USING btree (check_date);


--
-- Name: idx_lc_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lc_officer ON public.lodge_checks USING btree (officer_id);


--
-- Name: idx_lc_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lc_ps ON public.lodge_checks USING btree (ps_id);


--
-- Name: idx_msi_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_msi_offender ON public.messaging_intel USING btree (offender_id);


--
-- Name: idx_msi_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_msi_source ON public.messaging_intel USING btree (source_type);


--
-- Name: idx_mv_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mv_date ON public.mv_act_checks USING btree (created_at);


--
-- Name: idx_mv_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mv_officer ON public.mv_act_checks USING btree (officer_id);


--
-- Name: idx_mv_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mv_ps ON public.mv_act_checks USING btree (ps_id);


--
-- Name: idx_oc_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_oc_offender ON public.offender_contacts USING btree (offender_id);


--
-- Name: idx_oc_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_oc_type ON public.offender_contacts USING btree (contact_type);


--
-- Name: idx_oc_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_oc_value ON public.offender_contacts USING btree (value);


--
-- Name: idx_odp_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_odp_offender ON public.offender_drug_profile USING btree (offender_id);


--
-- Name: idx_of_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_of_offender ON public.offender_financials USING btree (offender_id);


--
-- Name: idx_of_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_of_type ON public.offender_financials USING btree (fin_type);


--
-- Name: idx_offenders_alias; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offenders_alias ON public.offenders USING btree (alias);


--
-- Name: idx_offenders_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offenders_category ON public.offenders USING btree (category);


--
-- Name: idx_offenders_district; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offenders_district ON public.offenders USING btree (district);


--
-- Name: idx_offenders_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offenders_name ON public.offenders USING btree (full_name);


--
-- Name: idx_offenders_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offenders_ps ON public.offenders USING btree (ps_id);


--
-- Name: idx_offenders_risk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offenders_risk ON public.offenders USING btree (risk_score);


--
-- Name: idx_offenders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offenders_status ON public.offenders USING btree (status);


--
-- Name: idx_oid_aadhaar; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_oid_aadhaar ON public.offender_identity_docs USING btree (aadhaar_no);


--
-- Name: idx_oid_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_oid_offender ON public.offender_identity_docs USING btree (offender_id);


--
-- Name: idx_pc_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pc_date ON public.petty_cases_checks USING btree (created_at);


--
-- Name: idx_pc_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pc_officer ON public.petty_cases_checks USING btree (officer_id);


--
-- Name: idx_pc_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pc_ps ON public.petty_cases_checks USING btree (ps_id);


--
-- Name: idx_pn_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pn_date ON public.palle_nidra_checks USING btree (created_at);


--
-- Name: idx_pn_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pn_officer ON public.palle_nidra_checks USING btree (officer_id);


--
-- Name: idx_pn_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pn_ps ON public.palle_nidra_checks USING btree (ps_id);


--
-- Name: idx_ps_district; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ps_district ON public.police_stations USING btree (district);


--
-- Name: idx_rc_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rc_date ON public.railway_checks USING btree (created_at);


--
-- Name: idx_rc_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rc_officer ON public.railway_checks USING btree (officer_id);


--
-- Name: idx_rc_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rc_ps ON public.railway_checks USING btree (ps_id);


--
-- Name: idx_rs_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rs_date ON public.rowdy_sheeter_checks USING btree (created_at);


--
-- Name: idx_rs_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rs_officer ON public.rowdy_sheeter_checks USING btree (officer_id);


--
-- Name: idx_rs_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rs_ps ON public.rowdy_sheeter_checks USING btree (ps_id);


--
-- Name: idx_rt_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rt_token ON public.refresh_tokens USING btree (token);


--
-- Name: idx_rt_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rt_user ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_scl_linked; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scl_linked ON public.supply_chain_links USING btree (linked_offender_id);


--
-- Name: idx_scl_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scl_offender ON public.supply_chain_links USING btree (offender_id);


--
-- Name: idx_scl_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scl_type ON public.supply_chain_links USING btree (link_type);


--
-- Name: idx_seizures_case; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seizures_case ON public.seizures USING btree (case_id);


--
-- Name: idx_smi_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_smi_offender ON public.social_media_intel USING btree (offender_id);


--
-- Name: idx_smi_platform; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_smi_platform ON public.social_media_intel USING btree (platform);


--
-- Name: idx_sr_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sr_date ON public.surveillance_records USING btree (scheduled_date);


--
-- Name: idx_sr_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sr_offender ON public.surveillance_records USING btree (offender_id);


--
-- Name: idx_sr_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sr_status ON public.surveillance_records USING btree (verification_status);


--
-- Name: idx_sr_verified_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sr_verified_by ON public.surveillance_records USING btree (verified_by);


--
-- Name: idx_sv_case; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sv_case ON public.seized_vehicles USING btree (case_id);


--
-- Name: idx_sv_reg; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sv_reg ON public.seized_vehicles USING btree (registration_no);


--
-- Name: idx_sv_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sv_status ON public.seized_vehicles USING btree (current_status);


--
-- Name: idx_tml_case; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tml_case ON public.tower_match_logs USING btree (case_id);


--
-- Name: idx_tml_mobile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tml_mobile ON public.tower_match_logs USING btree (mobile_number);


--
-- Name: idx_tml_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tml_time ON public.tower_match_logs USING btree (hit_time);


--
-- Name: idx_txn_amount; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_txn_amount ON public.transaction_records USING btree (amount);


--
-- Name: idx_txn_batch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_txn_batch ON public.transaction_records USING btree (batch_id);


--
-- Name: idx_txn_cp_account; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_txn_cp_account ON public.transaction_records USING btree (counterparty_account);


--
-- Name: idx_txn_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_txn_date ON public.transaction_records USING btree (txn_date);


--
-- Name: idx_txn_flagged; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_txn_flagged ON public.transaction_records USING btree (is_flagged);


--
-- Name: idx_txn_matched; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_txn_matched ON public.transaction_records USING btree (matched_offender_id);


--
-- Name: idx_txn_offender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_txn_offender ON public.transaction_records USING btree (offender_id);


--
-- Name: idx_users_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_dept ON public.users USING btree (department);


--
-- Name: idx_users_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_ps ON public.users USING btree (police_station_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_team; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_team ON public.users USING btree (team_id);


--
-- Name: idx_vc_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vc_date ON public.vehicle_checks USING btree (created_at);


--
-- Name: idx_vc_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vc_officer ON public.vehicle_checks USING btree (officer_id);


--
-- Name: idx_vc_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vc_ps ON public.vehicle_checks USING btree (ps_id);


--
-- Name: idx_vv_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vv_date ON public.village_visits USING btree (visit_date);


--
-- Name: idx_vv_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vv_officer ON public.village_visits USING btree (officer_id);


--
-- Name: idx_vv_ps; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vv_ps ON public.village_visits USING btree (ps_id);


--
-- Name: informers_code_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX informers_code_name_key ON public.informers USING btree (code_name);


--
-- Name: offender_drug_profile_offender_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX offender_drug_profile_offender_id_key ON public.offender_drug_profile USING btree (offender_id);


--
-- Name: police_stations_ps_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX police_stations_ps_code_key ON public.police_stations USING btree (ps_code);


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: teams_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX teams_name_key ON public.teams USING btree (name);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bail_records bail_records_case_accused_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bail_records
    ADD CONSTRAINT bail_records_case_accused_id_fkey FOREIGN KEY (case_accused_id) REFERENCES public.case_accused(id) ON DELETE SET NULL;


--
-- Name: bail_records bail_records_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bail_records
    ADD CONSTRAINT bail_records_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: bound_over_checks bound_over_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bound_over_checks
    ADD CONSTRAINT bound_over_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: bound_over_checks bound_over_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bound_over_checks
    ADD CONSTRAINT bound_over_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: bus_stand_checks bus_stand_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_stand_checks
    ADD CONSTRAINT bus_stand_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: bus_stand_checks bus_stand_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_stand_checks
    ADD CONSTRAINT bus_stand_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: case_accused case_accused_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_accused
    ADD CONSTRAINT case_accused_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: case_accused case_accused_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_accused
    ADD CONSTRAINT case_accused_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id);


--
-- Name: case_accused case_accused_previous_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_accused
    ADD CONSTRAINT case_accused_previous_ps_id_fkey FOREIGN KEY (previous_ps_id) REFERENCES public.police_stations(id);


--
-- Name: cases cases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: cases cases_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: charge_sheets charge_sheets_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.charge_sheets
    ADD CONSTRAINT charge_sheets_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: courier_checks courier_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courier_checks
    ADD CONSTRAINT courier_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: courier_checks courier_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courier_checks
    ADD CONSTRAINT courier_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: court_hearings court_hearings_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.court_hearings
    ADD CONSTRAINT court_hearings_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: deletion_requests deletion_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deletion_requests
    ADD CONSTRAINT deletion_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: deletion_requests deletion_requests_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deletion_requests
    ADD CONSTRAINT deletion_requests_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: deletion_requests deletion_requests_escalated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deletion_requests
    ADD CONSTRAINT deletion_requests_escalated_by_fkey FOREIGN KEY (escalated_by) REFERENCES public.users(id);


--
-- Name: deletion_requests deletion_requests_flagged_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deletion_requests
    ADD CONSTRAINT deletion_requests_flagged_by_fkey FOREIGN KEY (flagged_by) REFERENCES public.users(id);


--
-- Name: deletion_requests deletion_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deletion_requests
    ADD CONSTRAINT deletion_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: drone_surveillance_checks drone_surveillance_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drone_surveillance_checks
    ADD CONSTRAINT drone_surveillance_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: drone_surveillance_checks drone_surveillance_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drone_surveillance_checks
    ADD CONSTRAINT drone_surveillance_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: drunk_drive_checks drunk_drive_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drunk_drive_checks
    ADD CONSTRAINT drunk_drive_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: drunk_drive_checks drunk_drive_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drunk_drive_checks
    ADD CONSTRAINT drunk_drive_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: edit_requests edit_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edit_requests
    ADD CONSTRAINT edit_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: edit_requests edit_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edit_requests
    ADD CONSTRAINT edit_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: enforcement_checks enforcement_checks_committed_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_checks
    ADD CONSTRAINT enforcement_checks_committed_offender_id_fkey FOREIGN KEY (committed_offender_id) REFERENCES public.offenders(id);


--
-- Name: enforcement_checks enforcement_checks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_checks
    ADD CONSTRAINT enforcement_checks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: enforcement_checks enforcement_checks_matched_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_checks
    ADD CONSTRAINT enforcement_checks_matched_offender_id_fkey FOREIGN KEY (matched_offender_id) REFERENCES public.offenders(id);


--
-- Name: enforcement_checks enforcement_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_checks
    ADD CONSTRAINT enforcement_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: enforcement_checks enforcement_checks_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_checks
    ADD CONSTRAINT enforcement_checks_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: finance_upload_batches finance_upload_batches_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_upload_batches
    ADD CONSTRAINT finance_upload_batches_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: finance_upload_batches finance_upload_batches_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_upload_batches
    ADD CONSTRAINT finance_upload_batches_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: imei_records imei_records_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imei_records
    ADD CONSTRAINT imei_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: imei_records imei_records_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imei_records
    ADD CONSTRAINT imei_records_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: informers informers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.informers
    ADD CONSTRAINT informers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: intelligence_inputs intelligence_inputs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_inputs
    ADD CONSTRAINT intelligence_inputs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: intelligence_inputs intelligence_inputs_informer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_inputs
    ADD CONSTRAINT intelligence_inputs_informer_id_fkey FOREIGN KEY (informer_id) REFERENCES public.informers(id) ON DELETE SET NULL;


--
-- Name: intelligence_inputs intelligence_inputs_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_inputs
    ADD CONSTRAINT intelligence_inputs_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id);


--
-- Name: intelligence_inputs intelligence_inputs_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intelligence_inputs
    ADD CONSTRAINT intelligence_inputs_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: interrogation_sessions interrogation_sessions_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interrogation_sessions
    ADD CONSTRAINT interrogation_sessions_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE SET NULL;


--
-- Name: interrogation_sessions interrogation_sessions_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interrogation_sessions
    ADD CONSTRAINT interrogation_sessions_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: interrogation_sessions interrogation_sessions_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interrogation_sessions
    ADD CONSTRAINT interrogation_sessions_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: lodge_checks lodge_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lodge_checks
    ADD CONSTRAINT lodge_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: lodge_checks lodge_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lodge_checks
    ADD CONSTRAINT lodge_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: messaging_intel messaging_intel_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messaging_intel
    ADD CONSTRAINT messaging_intel_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: messaging_intel messaging_intel_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messaging_intel
    ADD CONSTRAINT messaging_intel_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: mv_act_checks mv_act_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mv_act_checks
    ADD CONSTRAINT mv_act_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: mv_act_checks mv_act_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mv_act_checks
    ADD CONSTRAINT mv_act_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: offender_contacts offender_contacts_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_contacts
    ADD CONSTRAINT offender_contacts_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: offender_drug_profile offender_drug_profile_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_drug_profile
    ADD CONSTRAINT offender_drug_profile_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: offender_financials offender_financials_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_financials
    ADD CONSTRAINT offender_financials_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: offender_identity_docs offender_identity_docs_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offender_identity_docs
    ADD CONSTRAINT offender_identity_docs_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: offenders offenders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offenders
    ADD CONSTRAINT offenders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: offenders offenders_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offenders
    ADD CONSTRAINT offenders_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: palle_nidra_checks palle_nidra_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.palle_nidra_checks
    ADD CONSTRAINT palle_nidra_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: palle_nidra_checks palle_nidra_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.palle_nidra_checks
    ADD CONSTRAINT palle_nidra_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: petty_cases_checks petty_cases_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.petty_cases_checks
    ADD CONSTRAINT petty_cases_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: petty_cases_checks petty_cases_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.petty_cases_checks
    ADD CONSTRAINT petty_cases_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: railway_checks railway_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.railway_checks
    ADD CONSTRAINT railway_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: railway_checks railway_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.railway_checks
    ADD CONSTRAINT railway_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: rowdy_sheeter_checks rowdy_sheeter_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rowdy_sheeter_checks
    ADD CONSTRAINT rowdy_sheeter_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: rowdy_sheeter_checks rowdy_sheeter_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rowdy_sheeter_checks
    ADD CONSTRAINT rowdy_sheeter_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: seized_vehicles seized_vehicles_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seized_vehicles
    ADD CONSTRAINT seized_vehicles_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: seized_vehicles seized_vehicles_seizure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seized_vehicles
    ADD CONSTRAINT seized_vehicles_seizure_id_fkey FOREIGN KEY (seizure_id) REFERENCES public.seizures(id) ON DELETE SET NULL;


--
-- Name: seizures seizures_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seizures
    ADD CONSTRAINT seizures_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: social_media_intel social_media_intel_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_intel
    ADD CONSTRAINT social_media_intel_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: social_media_intel social_media_intel_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_intel
    ADD CONSTRAINT social_media_intel_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: supply_chain_links supply_chain_links_linked_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_chain_links
    ADD CONSTRAINT supply_chain_links_linked_offender_id_fkey FOREIGN KEY (linked_offender_id) REFERENCES public.offenders(id);


--
-- Name: supply_chain_links supply_chain_links_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_chain_links
    ADD CONSTRAINT supply_chain_links_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: surveillance_records surveillance_records_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveillance_records
    ADD CONSTRAINT surveillance_records_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: surveillance_records surveillance_records_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveillance_records
    ADD CONSTRAINT surveillance_records_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: tower_match_logs tower_match_logs_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tower_match_logs
    ADD CONSTRAINT tower_match_logs_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: transaction_records transaction_records_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_records
    ADD CONSTRAINT transaction_records_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.finance_upload_batches(id) ON DELETE CASCADE;


--
-- Name: transaction_records transaction_records_matched_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_records
    ADD CONSTRAINT transaction_records_matched_offender_id_fkey FOREIGN KEY (matched_offender_id) REFERENCES public.offenders(id);


--
-- Name: transaction_records transaction_records_offender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_records
    ADD CONSTRAINT transaction_records_offender_id_fkey FOREIGN KEY (offender_id) REFERENCES public.offenders(id) ON DELETE CASCADE;


--
-- Name: users users_police_station_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_police_station_id_fkey FOREIGN KEY (police_station_id) REFERENCES public.police_stations(id);


--
-- Name: users users_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: vehicle_checks vehicle_checks_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_checks
    ADD CONSTRAINT vehicle_checks_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: vehicle_checks vehicle_checks_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_checks
    ADD CONSTRAINT vehicle_checks_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- Name: village_visits village_visits_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.village_visits
    ADD CONSTRAINT village_visits_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: village_visits village_visits_ps_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.village_visits
    ADD CONSTRAINT village_visits_ps_id_fkey FOREIGN KEY (ps_id) REFERENCES public.police_stations(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 4HIdQHWlXZhhrO6y6fMc4HmhIEES2G68zERvkkHCVIYCxx02Z12TREK1LaVh3pd


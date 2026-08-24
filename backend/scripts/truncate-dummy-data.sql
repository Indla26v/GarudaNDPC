-- =============================================================================
-- GARUDA NDPS MONITORING SYSTEM — PRE-DEPLOYMENT DATABASE TRUNCATE SCRIPT
-- =============================================================================
-- PURPOSE: Clears all dummy transactional/operational data, case records,
--          offender profiles, surveillance logs, and intelligence entries
--          while PRESERVING master reference data (districts, divisions,
--          police stations, teams, users, settings, and migration history).
-- =============================================================================

BEGIN;

-- 1. TRUNCATE AUDIT, AUTH & DUMMY USERS
TRUNCATE TABLE 
    refresh_tokens,
    password_history,
    deletion_requests,
    edit_requests,
    audit_logs,
    users
RESTART IDENTITY CASCADE;

-- 2. TRUNCATE CASE MANAGEMENT & SEIZURES
TRUNCATE TABLE 
    charge_sheets,
    court_hearings,
    bail_records,
    seized_vehicles,
    seizures,
    case_accused,
    cases
RESTART IDENTITY CASCADE;

-- 3. TRUNCATE TECHNICAL SURVEILLANCE & FINANCE INTELLIGENCE
TRUNCATE TABLE 
    tower_match_logs,
    social_media_intel,
    messaging_intel,
    transaction_records,
    finance_upload_batches
RESTART IDENTITY CASCADE;

-- 4. TRUNCATE PREVENTIVE & FIELD ENFORCEMENT MODULES
TRUNCATE TABLE 
    enforcement_checks,
    village_visits,
    lodge_checks,
    drunk_drive_checks,
    courier_checks,
    railway_checks,
    bus_stand_checks,
    rowdy_sheeter_checks,
    bound_over_checks,
    vehicle_checks,
    mv_act_checks,
    petty_cases_checks,
    palle_nidra_checks,
    drone_surveillance_checks
RESTART IDENTITY CASCADE;

-- 5. TRUNCATE OFFENDER PROFILES & INTELLIGENCE INPUTS
TRUNCATE TABLE 
    offender_contacts,
    offender_identity_docs,
    offender_drug_profile,
    offender_financials,
    supply_chain_links,
    surveillance_records,
    interrogation_sessions,
    imei_records,
    intelligence_inputs,
    informers,
    offenders
RESTART IDENTITY CASCADE;

-- OPTIONAL: If South India Data Bank was populated with dummy records:
-- TRUNCATE TABLE south_india_databank RESTART IDENTITY CASCADE;

COMMIT;

-- =============================================================================
-- VERIFICATION QUERY (Run this to verify counts of all tables)
-- =============================================================================
SELECT 
    schemaname, 
    relname AS table_name, 
    n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC, relname;

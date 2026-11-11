-- =============================================================================
-- WS3: Backfill / truth-repair (idempotent; NEVER deletes data)
-- Regent Analytics & AI Overhaul, 11 Nov 2026
--
-- Rebuilds trust in the legacy content_views rows:
--   1. tz_country_codes — IANA zone.tab → ISO-2 (persistent lookup, re-seeded)
--   2. country_code from the stored timezone-derived country/city
--      ("UTC"/region-only → NULL; ambiguous nested zones → NULL)
--   3. excluded_reason: internal (admin paths / admin sessions), bot, test, duplicate
--   4. is_returning recomputed from visitor_id (unknown rows → NULL, not false)
--   5. page_path populated for blog / case-study / resource rows from slugs
--   6. analytics_sessions rebuilt from historical sessions where possible
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tz_country_codes (
  tz text PRIMARY KEY,
  country_code text
);

INSERT INTO public.tz_country_codes (tz, country_code)
VALUES
('Africa/Abidjan', 'CI'),
('Africa/Accra', 'GH'),
('Africa/Addis_Ababa', 'ET'),
('Africa/Algiers', 'DZ'),
('Africa/Asmara', 'ER'),
('Africa/Bamako', 'ML'),
('Africa/Bangui', 'CF'),
('Africa/Banjul', 'GM'),
('Africa/Bissau', 'GW'),
('Africa/Blantyre', 'MW'),
('Africa/Brazzaville', 'CG'),
('Africa/Bujumbura', 'BI'),
('Africa/Cairo', 'EG'),
('Africa/Casablanca', 'MA'),
('Africa/Ceuta', 'ES'),
('Africa/Conakry', 'GN'),
('Africa/Dakar', 'SN'),
('Africa/Dar_es_Salaam', 'TZ'),
('Africa/Djibouti', 'DJ'),
('Africa/Douala', 'CM'),
('Africa/El_Aaiun', 'EH'),
('Africa/Freetown', 'SL'),
('Africa/Gaborone', 'BW'),
('Africa/Harare', 'ZW'),
('Africa/Johannesburg', 'ZA'),
('Africa/Juba', 'SS'),
('Africa/Kampala', 'UG'),
('Africa/Khartoum', 'SD'),
('Africa/Kigali', 'RW'),
('Africa/Kinshasa', 'CD'),
('Africa/Lagos', 'NG'),
('Africa/Libreville', 'GA'),
('Africa/Lome', 'TG'),
('Africa/Luanda', 'AO'),
('Africa/Lubumbashi', 'CD'),
('Africa/Lusaka', 'ZM'),
('Africa/Malabo', 'GQ'),
('Africa/Maputo', 'MZ'),
('Africa/Maseru', 'LS'),
('Africa/Mbabane', 'SZ'),
('Africa/Mogadishu', 'SO'),
('Africa/Monrovia', 'LR'),
('Africa/Nairobi', 'KE'),
('Africa/Ndjamena', 'TD'),
('Africa/Niamey', 'NE'),
('Africa/Nouakchott', 'MR'),
('Africa/Ouagadougou', 'BF'),
('Africa/Porto-Novo', 'BJ'),
('Africa/Sao_Tome', 'ST'),
('Africa/Tripoli', 'LY'),
('Africa/Tunis', 'TN'),
('Africa/Windhoek', 'NA'),
('America/Adak', 'US'),
('America/Anchorage', 'US'),
('America/Anguilla', 'AI'),
('America/Antigua', 'AG'),
('America/Araguaina', 'BR'),
('America/Argentina/Buenos_Aires', 'AR'),
('America/Argentina/Catamarca', 'AR'),
('America/Argentina/Cordoba', 'AR'),
('America/Argentina/Jujuy', 'AR'),
('America/Argentina/La_Rioja', 'AR'),
('America/Argentina/Mendoza', 'AR'),
('America/Argentina/Rio_Gallegos', 'AR'),
('America/Argentina/Salta', 'AR'),
('America/Argentina/San_Juan', 'AR'),
('America/Argentina/San_Luis', 'AR'),
('America/Argentina/Tucuman', 'AR'),
('America/Argentina/Ushuaia', 'AR'),
('America/Aruba', 'AW'),
('America/Asuncion', 'PY'),
('America/Atikokan', 'CA'),
('America/Bahia', 'BR'),
('America/Bahia_Banderas', 'MX'),
('America/Barbados', 'BB'),
('America/Belem', 'BR'),
('America/Belize', 'BZ'),
('America/Blanc-Sablon', 'CA'),
('America/Boa_Vista', 'BR'),
('America/Bogota', 'CO'),
('America/Boise', 'US'),
('America/Cambridge_Bay', 'CA'),
('America/Campo_Grande', 'BR'),
('America/Cancun', 'MX'),
('America/Caracas', 'VE'),
('America/Cayenne', 'GF'),
('America/Cayman', 'KY'),
('America/Chicago', 'US'),
('America/Chihuahua', 'MX'),
('America/Ciudad_Juarez', 'MX'),
('America/Costa_Rica', 'CR'),
('America/Coyhaique', 'CL'),
('America/Creston', 'CA'),
('America/Cuiaba', 'BR'),
('America/Curacao', 'CW'),
('America/Danmarkshavn', 'GL'),
('America/Dawson', 'CA'),
('America/Dawson_Creek', 'CA'),
('America/Denver', 'US'),
('America/Detroit', 'US'),
('America/Dominica', 'DM'),
('America/Edmonton', 'CA'),
('America/Eirunepe', 'BR'),
('America/El_Salvador', 'SV'),
('America/Fort_Nelson', 'CA'),
('America/Fortaleza', 'BR'),
('America/Glace_Bay', 'CA'),
('America/Goose_Bay', 'CA'),
('America/Grand_Turk', 'TC'),
('America/Grenada', 'GD'),
('America/Guadeloupe', 'GP'),
('America/Guatemala', 'GT'),
('America/Guayaquil', 'EC'),
('America/Guyana', 'GY'),
('America/Halifax', 'CA'),
('America/Havana', 'CU'),
('America/Hermosillo', 'MX'),
('America/Indiana/Indianapolis', 'US'),
('America/Indiana/Knox', 'US'),
('America/Indiana/Marengo', 'US'),
('America/Indiana/Petersburg', 'US'),
('America/Indiana/Tell_City', 'US'),
('America/Indiana/Vevay', 'US'),
('America/Indiana/Vincennes', 'US'),
('America/Indiana/Winamac', 'US'),
('America/Inuvik', 'CA'),
('America/Iqaluit', 'CA'),
('America/Jamaica', 'JM'),
('America/Juneau', 'US'),
('America/Kentucky/Louisville', 'US'),
('America/Kentucky/Monticello', 'US'),
('America/Kralendijk', 'BQ'),
('America/La_Paz', 'BO'),
('America/Lima', 'PE'),
('America/Los_Angeles', 'US'),
('America/Lower_Princes', 'SX'),
('America/Maceio', 'BR'),
('America/Managua', 'NI'),
('America/Manaus', 'BR'),
('America/Marigot', 'MF'),
('America/Martinique', 'MQ'),
('America/Matamoros', 'MX'),
('America/Mazatlan', 'MX'),
('America/Menominee', 'US'),
('America/Merida', 'MX'),
('America/Metlakatla', 'US'),
('America/Mexico_City', 'MX'),
('America/Miquelon', 'PM'),
('America/Moncton', 'CA'),
('America/Monterrey', 'MX'),
('America/Montevideo', 'UY'),
('America/Montserrat', 'MS'),
('America/Nassau', 'BS'),
('America/New_York', 'US'),
('America/Nome', 'US'),
('America/Noronha', 'BR'),
('America/North_Dakota/Beulah', 'US'),
('America/North_Dakota/Center', 'US'),
('America/North_Dakota/New_Salem', 'US'),
('America/Nuuk', 'GL'),
('America/Ojinaga', 'MX'),
('America/Panama', 'PA'),
('America/Paramaribo', 'SR'),
('America/Phoenix', 'US'),
('America/Port-au-Prince', 'HT'),
('America/Port_of_Spain', 'TT'),
('America/Porto_Velho', 'BR'),
('America/Puerto_Rico', 'PR'),
('America/Punta_Arenas', 'CL'),
('America/Rankin_Inlet', 'CA'),
('America/Recife', 'BR'),
('America/Regina', 'CA'),
('America/Resolute', 'CA'),
('America/Rio_Branco', 'BR'),
('America/Santarem', 'BR'),
('America/Santiago', 'CL'),
('America/Santo_Domingo', 'DO'),
('America/Sao_Paulo', 'BR'),
('America/Scoresbysund', 'GL'),
('America/Sitka', 'US'),
('America/St_Barthelemy', 'BL'),
('America/St_Johns', 'CA'),
('America/St_Kitts', 'KN'),
('America/St_Lucia', 'LC'),
('America/St_Thomas', 'VI'),
('America/St_Vincent', 'VC'),
('America/Swift_Current', 'CA'),
('America/Tegucigalpa', 'HN'),
('America/Thule', 'GL'),
('America/Tijuana', 'MX'),
('America/Toronto', 'CA'),
('America/Tortola', 'VG'),
('America/Vancouver', 'CA'),
('America/Whitehorse', 'CA'),
('America/Winnipeg', 'CA'),
('America/Yakutat', 'US'),
('Antarctica/Casey', 'AQ'),
('Antarctica/Davis', 'AQ'),
('Antarctica/DumontDUrville', 'AQ'),
('Antarctica/Macquarie', 'AU'),
('Antarctica/Mawson', 'AQ'),
('Antarctica/McMurdo', 'AQ'),
('Antarctica/Palmer', 'AQ'),
('Antarctica/Rothera', 'AQ'),
('Antarctica/Syowa', 'AQ'),
('Antarctica/Troll', 'AQ'),
('Antarctica/Vostok', 'AQ'),
('Arctic/Longyearbyen', 'SJ'),
('Asia/Aden', 'YE'),
('Asia/Almaty', 'KZ'),
('Asia/Amman', 'JO'),
('Asia/Anadyr', 'RU'),
('Asia/Aqtau', 'KZ'),
('Asia/Aqtobe', 'KZ'),
('Asia/Ashgabat', 'TM'),
('Asia/Atyrau', 'KZ'),
('Asia/Baghdad', 'IQ'),
('Asia/Bahrain', 'BH'),
('Asia/Baku', 'AZ'),
('Asia/Bangkok', 'TH'),
('Asia/Barnaul', 'RU'),
('Asia/Beirut', 'LB'),
('Asia/Bishkek', 'KG'),
('Asia/Brunei', 'BN'),
('Asia/Chita', 'RU'),
('Asia/Colombo', 'LK'),
('Asia/Damascus', 'SY'),
('Asia/Dhaka', 'BD'),
('Asia/Dili', 'TL'),
('Asia/Dubai', 'AE'),
('Asia/Dushanbe', 'TJ'),
('Asia/Famagusta', 'CY'),
('Asia/Gaza', 'PS'),
('Asia/Hebron', 'PS'),
('Asia/Ho_Chi_Minh', 'VN'),
('Asia/Hong_Kong', 'HK'),
('Asia/Hovd', 'MN'),
('Asia/Irkutsk', 'RU'),
('Asia/Jakarta', 'ID'),
('Asia/Jayapura', 'ID'),
('Asia/Jerusalem', 'IL'),
('Asia/Kabul', 'AF'),
('Asia/Kamchatka', 'RU'),
('Asia/Karachi', 'PK'),
('Asia/Kathmandu', 'NP'),
('Asia/Khandyga', 'RU'),
('Asia/Kolkata', 'IN'),
('Asia/Krasnoyarsk', 'RU'),
('Asia/Kuala_Lumpur', 'MY'),
('Asia/Kuching', 'MY'),
('Asia/Kuwait', 'KW'),
('Asia/Macau', 'MO'),
('Asia/Magadan', 'RU'),
('Asia/Makassar', 'ID'),
('Asia/Manila', 'PH'),
('Asia/Muscat', 'OM'),
('Asia/Nicosia', 'CY'),
('Asia/Novokuznetsk', 'RU'),
('Asia/Novosibirsk', 'RU'),
('Asia/Omsk', 'RU'),
('Asia/Oral', 'KZ'),
('Asia/Phnom_Penh', 'KH'),
('Asia/Pontianak', 'ID'),
('Asia/Pyongyang', 'KP'),
('Asia/Qatar', 'QA'),
('Asia/Qostanay', 'KZ'),
('Asia/Qyzylorda', 'KZ'),
('Asia/Riyadh', 'SA'),
('Asia/Sakhalin', 'RU'),
('Asia/Samarkand', 'UZ'),
('Asia/Seoul', 'KR'),
('Asia/Shanghai', 'CN'),
('Asia/Singapore', 'SG'),
('Asia/Srednekolymsk', 'RU'),
('Asia/Taipei', 'TW'),
('Asia/Tashkent', 'UZ'),
('Asia/Tbilisi', 'GE'),
('Asia/Tehran', 'IR'),
('Asia/Thimphu', 'BT'),
('Asia/Tokyo', 'JP'),
('Asia/Tomsk', 'RU'),
('Asia/Ulaanbaatar', 'MN'),
('Asia/Urumqi', 'CN'),
('Asia/Ust-Nera', 'RU'),
('Asia/Vientiane', 'LA'),
('Asia/Vladivostok', 'RU'),
('Asia/Yakutsk', 'RU'),
('Asia/Yangon', 'MM'),
('Asia/Yekaterinburg', 'RU'),
('Asia/Yerevan', 'AM'),
('Atlantic/Azores', 'PT'),
('Atlantic/Bermuda', 'BM'),
('Atlantic/Canary', 'ES'),
('Atlantic/Cape_Verde', 'CV'),
('Atlantic/Faroe', 'FO'),
('Atlantic/Madeira', 'PT'),
('Atlantic/Reykjavik', 'IS'),
('Atlantic/South_Georgia', 'GS'),
('Atlantic/St_Helena', 'SH'),
('Atlantic/Stanley', 'FK'),
('Australia/Adelaide', 'AU'),
('Australia/Brisbane', 'AU'),
('Australia/Broken_Hill', 'AU'),
('Australia/Darwin', 'AU'),
('Australia/Eucla', 'AU'),
('Australia/Hobart', 'AU'),
('Australia/Lindeman', 'AU'),
('Australia/Lord_Howe', 'AU'),
('Australia/Melbourne', 'AU'),
('Australia/Perth', 'AU'),
('Australia/Sydney', 'AU'),
('Europe/Amsterdam', 'NL'),
('Europe/Andorra', 'AD'),
('Europe/Astrakhan', 'RU'),
('Europe/Athens', 'GR'),
('Europe/Belgrade', 'RS'),
('Europe/Berlin', 'DE'),
('Europe/Bratislava', 'SK'),
('Europe/Brussels', 'BE'),
('Europe/Bucharest', 'RO'),
('Europe/Budapest', 'HU'),
('Europe/Busingen', 'DE'),
('Europe/Chisinau', 'MD'),
('Europe/Copenhagen', 'DK'),
('Europe/Dublin', 'IE'),
('Europe/Gibraltar', 'GI'),
('Europe/Guernsey', 'GG'),
('Europe/Helsinki', 'FI'),
('Europe/Isle_of_Man', 'IM'),
('Europe/Istanbul', 'TR'),
('Europe/Jersey', 'JE'),
('Europe/Kaliningrad', 'RU'),
('Europe/Kirov', 'RU'),
('Europe/Kyiv', 'UA'),
('Europe/Lisbon', 'PT'),
('Europe/Ljubljana', 'SI'),
('Europe/London', 'GB'),
('Europe/Luxembourg', 'LU'),
('Europe/Madrid', 'ES'),
('Europe/Malta', 'MT'),
('Europe/Mariehamn', 'AX'),
('Europe/Minsk', 'BY'),
('Europe/Monaco', 'MC'),
('Europe/Moscow', 'RU'),
('Europe/Oslo', 'NO'),
('Europe/Paris', 'FR'),
('Europe/Podgorica', 'ME'),
('Europe/Prague', 'CZ'),
('Europe/Riga', 'LV'),
('Europe/Rome', 'IT'),
('Europe/Samara', 'RU'),
('Europe/San_Marino', 'SM'),
('Europe/Sarajevo', 'BA'),
('Europe/Saratov', 'RU'),
('Europe/Simferopol', 'UA'),
('Europe/Skopje', 'MK'),
('Europe/Sofia', 'BG'),
('Europe/Stockholm', 'SE'),
('Europe/Tallinn', 'EE'),
('Europe/Tirane', 'AL'),
('Europe/Ulyanovsk', 'RU'),
('Europe/Vaduz', 'LI'),
('Europe/Vatican', 'VA'),
('Europe/Vienna', 'AT'),
('Europe/Vilnius', 'LT'),
('Europe/Volgograd', 'RU'),
('Europe/Warsaw', 'PL'),
('Europe/Zagreb', 'HR'),
('Europe/Zurich', 'CH'),
('Indian/Antananarivo', 'MG'),
('Indian/Chagos', 'IO'),
('Indian/Christmas', 'CX'),
('Indian/Cocos', 'CC'),
('Indian/Comoro', 'KM'),
('Indian/Kerguelen', 'TF'),
('Indian/Mahe', 'SC'),
('Indian/Maldives', 'MV'),
('Indian/Mauritius', 'MU'),
('Indian/Mayotte', 'YT'),
('Indian/Reunion', 'RE'),
('Pacific/Apia', 'WS'),
('Pacific/Auckland', 'NZ'),
('Pacific/Bougainville', 'PG'),
('Pacific/Chatham', 'NZ'),
('Pacific/Chuuk', 'FM'),
('Pacific/Easter', 'CL'),
('Pacific/Efate', 'VU'),
('Pacific/Fakaofo', 'TK'),
('Pacific/Fiji', 'FJ'),
('Pacific/Funafuti', 'TV'),
('Pacific/Galapagos', 'EC'),
('Pacific/Gambier', 'PF'),
('Pacific/Guadalcanal', 'SB'),
('Pacific/Guam', 'GU'),
('Pacific/Honolulu', 'US'),
('Pacific/Kanton', 'KI'),
('Pacific/Kiritimati', 'KI'),
('Pacific/Kosrae', 'FM'),
('Pacific/Kwajalein', 'MH'),
('Pacific/Majuro', 'MH'),
('Pacific/Marquesas', 'PF'),
('Pacific/Midway', 'UM'),
('Pacific/Nauru', 'NR'),
('Pacific/Niue', 'NU'),
('Pacific/Norfolk', 'NF'),
('Pacific/Noumea', 'NC'),
('Pacific/Pago_Pago', 'AS'),
('Pacific/Palau', 'PW'),
('Pacific/Pitcairn', 'PN'),
('Pacific/Pohnpei', 'FM'),
('Pacific/Port_Moresby', 'PG'),
('Pacific/Rarotonga', 'CK'),
('Pacific/Saipan', 'MP'),
('Pacific/Tahiti', 'PF'),
('Pacific/Tarawa', 'KI'),
('Pacific/Tongatapu', 'TO'),
('Pacific/Wake', 'UM'),
('Pacific/Wallis', 'WF'),
('TZ', '#code')
ON CONFLICT (tz) DO NOTHING;

-- Map stored timezone-derived region/city to a real ISO-2 country code.
-- The old client stored country=tz[0] ("Europe") and city=tz[1] ("London"),
-- so a legacy "Europe/London" now becomes GB. "UTC"/"Etc"/region-only rows and
-- ambiguous nested zones (e.g. America/Argentina) match nothing and stay NULL.
UPDATE public.content_views cv
SET country_code = t.country_code
FROM public.tz_country_codes t
WHERE cv.country_code IS NULL
  AND cv.country IS NOT NULL
  AND cv.city IS NOT NULL
  AND t.tz = cv.country || '/' || replace(cv.city, ' ', '_');

-- -----------------------------------------------------------------------------
-- excluded_reason flags (highest-priority first; never overwrite an existing reason)
-- -----------------------------------------------------------------------------
-- 'internal': admin paths, and every row sharing a session with an admin page view
UPDATE public.content_views
SET excluded_reason = 'internal'
WHERE excluded_reason IS NULL
  AND (
    page_path LIKE '/admin/%'
    OR session_id IN (
      SELECT session_id FROM public.content_views
      WHERE page_path LIKE '/admin/%' AND session_id IS NOT NULL
    )
  );

-- 'bot': unparseable UA / CLI devices
UPDATE public.content_views
SET excluded_reason = 'bot'
WHERE excluded_reason IS NULL
  AND (device_type = 'cli' OR browser = 'Unknown' OR referrer ILIKE '%curl%');

-- 'test': obviously fake
UPDATE public.content_views
SET excluded_reason = 'test'
WHERE excluded_reason IS NULL
  AND (country = 'test' OR country ILIKE '%test%');

-- 'duplicate': same session + same path within 5 seconds (SPA re-mount double fire)
WITH dups AS (
  SELECT id,
         lag(created_at) OVER (PARTITION BY session_id, page_path ORDER BY created_at) AS prev_ts
  FROM public.content_views
  WHERE session_id IS NOT NULL
)
UPDATE public.content_views cv
SET excluded_reason = 'duplicate'
FROM dups d
WHERE cv.id = d.id
  AND cv.excluded_reason IS NULL
  AND d.prev_ts IS NOT NULL
  AND cv.created_at - d.prev_ts < interval '5 seconds';

-- -----------------------------------------------------------------------------
-- is_returning from visitor_id: a view is 'returning' when a strictly earlier
-- session exists for the same visitor. Rows with no visitor_id are UNKNOWN
-- (NULL), not false.
-- -----------------------------------------------------------------------------
UPDATE public.content_views cv
SET is_returning = EXISTS (
  SELECT 1 FROM public.content_views earlier
  WHERE earlier.visitor_id = cv.visitor_id
    AND earlier.session_id IS DISTINCT FROM cv.session_id
    AND earlier.created_at < cv.created_at
)
WHERE cv.visitor_id IS NOT NULL;

UPDATE public.content_views
SET is_returning = NULL
WHERE visitor_id IS NULL AND is_returning IS NOT NULL;

-- -----------------------------------------------------------------------------
-- page_path for content rows, from the UNIQUE slugs
-- -----------------------------------------------------------------------------
UPDATE public.content_views cv
SET page_path = '/blog/' || bp.slug
FROM public.blog_posts bp
WHERE cv.content_type = 'blog_post' AND cv.content_id = bp.id AND cv.page_path IS NULL;

UPDATE public.content_views cv
SET page_path = '/case-studies/' || cs.slug
FROM public.case_studies cs
WHERE cv.content_type = 'case_study' AND cv.content_id = cs.id AND cv.page_path IS NULL;

UPDATE public.content_views cv
SET page_path = '/resources/' || r.slug
FROM public.resources r
WHERE cv.content_type IN ('resource', 'resource_download') AND cv.content_id = r.id AND cv.page_path IS NULL;

-- -----------------------------------------------------------------------------
-- analytics_sessions from historical sessions (best effort; utm history is gone)
-- -----------------------------------------------------------------------------
INSERT INTO public.analytics_sessions (
  session_id, visitor_id, started_at, last_seen_at, landing_path,
  device_type, browser, os, is_returning
)
SELECT
  cv.session_id,
  MIN(cv.visitor_id) AS visitor_id,
  MIN(cv.created_at) AS started_at,
  MAX(cv.created_at) AS last_seen_at,
  (array_agg(cv.page_path ORDER BY cv.created_at))[1] AS landing_path,
  MIN(cv.device_type) AS device_type,
  MIN(cv.browser) AS browser,
  MIN(cv.os) AS os,
  NULL AS is_returning
FROM public.content_views cv
WHERE cv.session_id IS NOT NULL
GROUP BY cv.session_id
ON CONFLICT (session_id) DO NOTHING;

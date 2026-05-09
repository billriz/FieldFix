alter table public.files
add column if not exists name text,
add column if not exists description text,
add column if not exists machine_type text,
add column if not exists category text,
add column if not exists tags text[] not null default '{}';

update public.files
set name = filename
where name is null;

create index if not exists files_machine_type_idx
on public.files (machine_type);

create index if not exists files_category_idx
on public.files (category);

create index if not exists files_tags_idx
on public.files using gin (tags);

drop policy if exists "Public can read files" on public.files;

create policy "Public can read files"
on public.files
for select
to anon, authenticated
using (true);

insert into public.files (
  id,
  bucket,
  path,
  filename,
  name,
  description,
  machine_type,
  category,
  content_type,
  size_bytes,
  tags
)
values
  (
    '44444444-4444-4444-8444-444444444441',
    'fix-files',
    'atm/ncr-6634-dispenser-recovery-checklist.pdf',
    'ncr-6634-dispenser-recovery-checklist.pdf',
    'NCR 6634 dispenser recovery checklist.pdf',
    'Step-by-step field checklist for safe dispenser recovery after presenter jams.',
    'ATM',
    'Manuals',
    'application/pdf',
    1887437,
    array['ncr', 'dispenser', 'jam', 'recovery']
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    'fix-files',
    'atm/hyosung-mx5200-receipt-printer-quick-guide.pdf',
    'hyosung-mx5200-receipt-printer-quick-guide.pdf',
    'Hyosung MX5200 receipt printer quick guide.pdf',
    'Common receipt printer symptoms, reset sequence, and part verification notes.',
    'ATM',
    'Manuals',
    'application/pdf',
    962560,
    array['hyosung', 'receipt', 'printer', 'reset']
  ),
  (
    '44444444-4444-4444-8444-444444444443',
    'fix-files',
    'atm/cash-cassette-inspection-form.xlsx',
    'cash-cassette-inspection-form.xlsx',
    'ATM cash cassette inspection form.xlsx',
    'Reusable inspection form for cassette fit, latch condition, and denomination setup.',
    'ATM',
    'Forms',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    327680,
    array['cash', 'cassette', 'inspection']
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'fix-files',
    'tcr/glory-rbg-100-sensor-map.png',
    'glory-rbg-100-sensor-map.png',
    'Glory RBG-100 sensor map.png',
    'Annotated sensor map for transport faults and reject path troubleshooting.',
    'TCR',
    'Diagrams',
    'image/png',
    2411725,
    array['glory', 'sensor', 'transport', 'reject']
  ),
  (
    '44444444-4444-4444-8444-444444444445',
    'fix-files',
    'tcr/tcr-calibration-sign-off.pdf',
    'tcr-calibration-sign-off.pdf',
    'TCR calibration sign-off.pdf',
    'Branch sign-off packet for calibration completion and variance notes.',
    'TCR',
    'Forms',
    'application/pdf',
    696320,
    array['calibration', 'sign-off', 'variance']
  ),
  (
    '44444444-4444-4444-8444-444444444446',
    'fix-files',
    'drive-up/camera-alignment-reference.jpg',
    'camera-alignment-reference.jpg',
    'Drive-up camera alignment reference.jpg',
    'Reference captures for field of view, glare checks, and lane coverage.',
    'Drive-Up',
    'Diagrams',
    'image/jpeg',
    4299161,
    array['camera', 'alignment', 'lane', 'glare']
  ),
  (
    '44444444-4444-4444-8444-444444444447',
    'fix-files',
    'cameras/dvr-firmware-release-notes.txt',
    'dvr-firmware-release-notes.txt',
    'DVR firmware release notes.txt',
    'Current branch DVR firmware notes, known issues, and rollback guidance.',
    'Cameras',
    'Firmware',
    'text/plain',
    86016,
    array['dvr', 'firmware', 'rollback']
  ),
  (
    '44444444-4444-4444-8444-444444444448',
    'fix-files',
    'cameras/alarm-panel-service-authorization.pdf',
    'alarm-panel-service-authorization.pdf',
    'Alarm panel service authorization.pdf',
    'Authorization form for service windows, testing contacts, and monitoring bypass.',
    'Cameras',
    'Forms',
    'application/pdf',
    522240,
    array['alarm', 'authorization', 'monitoring', 'bypass']
  )
on conflict (bucket, path) do update
set
  filename = excluded.filename,
  name = excluded.name,
  description = excluded.description,
  machine_type = excluded.machine_type,
  category = excluded.category,
  content_type = excluded.content_type,
  size_bytes = excluded.size_bytes,
  tags = excluded.tags;

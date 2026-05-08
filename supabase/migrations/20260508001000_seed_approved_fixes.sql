insert into public.fixes (id, title, description, error_code, model, status, approved)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Receipt printer jam after cash withdrawal',
    'Clear paper from the cutter path, reseat the roll, and run a receipt test from supervisor mode before returning the ATM to service.',
    'E-204',
    'ATM',
    'open',
    true
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'TCR cassette count mismatch',
    'Confirm cassette position, inspect the feed rollers for debris, then complete a reconciliation cycle with dual control present.',
    'C-118',
    'TCR',
    'open',
    true
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Drive-up lane audio is one-way only',
    'Check teller station mute state, reseat the lane audio connector, and verify the microphone level at the customer unit.',
    null,
    'Drive-Up',
    'open',
    true
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  error_code = excluded.error_code,
  model = excluded.model,
  status = excluded.status,
  approved = excluded.approved;

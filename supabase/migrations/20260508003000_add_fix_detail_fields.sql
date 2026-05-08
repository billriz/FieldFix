alter table public.fixes
add column if not exists machine_type text,
add column if not exists manufacturer text,
add column if not exists symptoms text,
add column if not exists fix_steps text[] not null default '{}',
add column if not exists parts_used text[] not null default '{}';

update public.fixes
set
  machine_type = 'ATM',
  manufacturer = 'NCR',
  symptoms = 'Receipt printer reports a cutter path jam after a cash withdrawal.',
  fix_steps = array[
    'Open the receipt printer bay and remove any loose paper from the cutter path.',
    'Reseat the receipt roll so the paper feeds squarely through the guides.',
    'Run a receipt test from supervisor mode.',
    'Return the ATM to service after the test receipt prints cleanly.'
  ],
  parts_used = array['Receipt paper roll']
where id = '11111111-1111-4111-8111-111111111111';

update public.fixes
set
  machine_type = 'TCR',
  manufacturer = 'Glory',
  symptoms = 'Cassette totals do not match the expected count during reconciliation.',
  fix_steps = array[
    'Confirm each cassette is seated in the correct position.',
    'Inspect the feed rollers and remove any debris.',
    'Complete a reconciliation cycle with dual control present.',
    'Verify the count mismatch clears before closing the service call.'
  ],
  parts_used = array['Lint-free cleaning cloth']
where id = '22222222-2222-4222-8222-222222222222';

update public.fixes
set
  machine_type = 'Drive-Up',
  manufacturer = 'Hamilton',
  symptoms = 'Customer can hear the teller, but teller audio from the lane is not coming through.',
  fix_steps = array[
    'Check that the teller station is not muted.',
    'Reseat the lane audio connector at the teller station.',
    'Verify the microphone level at the customer unit.',
    'Place a test call through the lane and confirm two-way audio.'
  ],
  parts_used = array['Audio connector']
where id = '33333333-3333-4333-8333-333333333333';

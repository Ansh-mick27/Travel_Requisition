create table if not exists drivers (
    id uuid default gen_random_uuid() primary key,
    full_name text not null,
    phone_number text,
    status text default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Policy to allow read access to everyone (or authenticated)
alter table drivers enable row level security;

create policy "Enable read access for all users" on drivers
    for select using (true);

create policy "Enable insert for admins" on drivers
    for insert with check (true); -- ideally check role, but for now open or check trigger

create policy "Enable update for admins" on drivers
    for update using (true);

create policy "Enable delete for admins" on drivers
    for delete using (true);

-- 1. Create a function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, department)
  values (new.id, new.email, 'requester', 'N/A');
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Backfill profiles for existing users who don't have one
insert into public.profiles (id, email, role, department)
select id, email, 'requester', 'N/A'
from auth.users
where id not in (select id from public.profiles);

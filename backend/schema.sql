begin;
create table public.date_invitations (
 token_hash text primary key,
 expires_at timestamptz not null default now() + interval '180 days',
 enabled boolean not null default true
);
create table public.date_responses (
 id uuid primary key,
 chosen_date date not null,
 pickup_time time not null default '16:30' check (pickup_time = '16:30'),
 timezone text not null default 'Asia/Manila' check (timezone = 'Asia/Manila'),
 jane_color text not null check (jane_color in ('cream','brown','black','navy','sage','rose','white')),
 luke_color text not null check (luke_color in ('cream','brown','black','navy','sage','rose','white')),
 created_at timestamptz not null default now(),
 invitation_hash text not null references public.date_invitations(token_hash)
);
create index date_responses_invitation_hash_idx on public.date_responses(invitation_hash);
alter table public.date_responses enable row level security;
alter table public.date_invitations enable row level security;
revoke all on public.date_responses, public.date_invitations from public, anon, authenticated;
grant select, insert on public.date_responses to service_role;
grant select on public.date_invitations to service_role;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
commit;

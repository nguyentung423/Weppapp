create table if not exists readings (
  id bigint generated always as identity primary key,
  timestamp timestamptz not null,
  light_intensity double precision not null,
  temperature double precision not null,
  humidity double precision not null,
  co2 double precision not null,
  ec double precision not null,
  ph double precision not null,
  water_level double precision not null,
  pump_status boolean not null,
  fan_status boolean not null,
  operating_time integer not null,
  stable boolean not null
);

create table if not exists current_state (
  id text primary key,
  timestamp timestamptz not null,
  light_intensity double precision not null,
  temperature double precision not null,
  humidity double precision not null,
  co2 double precision not null,
  ec double precision not null,
  ph double precision not null,
  water_level double precision not null,
  pump_status boolean not null,
  fan_status boolean not null,
  operating_time integer not null,
  stable boolean not null
);

create table if not exists alerts (
  id uuid primary key,
  code text not null,
  title text not null,
  severity text not null,
  explanation text not null,
  recommendation text not null,
  timestamp timestamptz not null
);

create table if not exists scenario_state (
  id text primary key,
  mode text not null,
  active_since timestamptz not null
);

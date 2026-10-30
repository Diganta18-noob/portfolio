-- Optional: seed your real projects without overwriting existing entries. Run after setup.sql.
insert into public.projects ("Title","Description","Img","Link","Github","TechStack","Features",is_published,order_index)
select 'Thoughts Whatever','A digital home for Bengali literature and documentary storytelling, with editorial publishing tools and a multilingual reading experience.','/project-thoughts-whatever.svg','https://www.thoughtswhatever.in','https://github.com/Diganta18-noob/Thoughts-Whatever','["Next.js","TypeScript","Full stack","Editorial CMS"]'::jsonb,'[]'::jsonb,true,1
where not exists(select 1 from public.projects where "Title"='Thoughts Whatever');

insert into public.projects ("Title","Description","Img","Link","Github","TechStack","Features",is_published,order_index)
select 'DogCart','A MERN e-commerce application with a responsive interface, shopping cart controls, and product catalog management.','/project-dogcart.svg','','https://github.com/Diganta18-noob/DogCart','["React","Redux","Node.js","Express","MongoDB"]'::jsonb,'[]'::jsonb,true,2
where not exists(select 1 from public.projects where "Title"='DogCart');

insert into public.projects ("Title","Description","Img","Link","Github","TechStack","Features",is_published,order_index)
select 'Loanapp','A financial portal for loan applications, calculations, and repayment structures, with authentication and interactive dashboards.','/project-loanapp.svg','','https://github.com/Diganta18-noob/Loanapp','["React","Node.js","Express","MongoDB"]'::jsonb,'[]'::jsonb,true,3
where not exists(select 1 from public.projects where "Title"='Loanapp');

insert into public.projects ("Title","Description","Img","Link","Github","TechStack","Features",is_published,order_index)
select 'Realtime Chat App','Real-time messaging with rooms, active status indicators, and instant delivery over WebSockets.','/project-realtime-chat.svg','','https://github.com/Diganta18-noob/Realtime-chat-app','["React","Socket.io","Node.js","Express","MongoDB"]'::jsonb,'[]'::jsonb,true,4
where not exists(select 1 from public.projects where "Title"='Realtime Chat App');


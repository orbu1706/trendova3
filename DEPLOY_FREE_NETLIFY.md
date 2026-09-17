# Tutorial Deploy TRENDOVA (Netlify + Supabase)

1. Push seluruh isi repository ke GitHub.
2. Di Netlify pilih **Add new project → Import an existing project → GitHub**.
3. Pilih repository TRENDOVA.
4. Biarkan Build command kosong.
5. Pastikan Publish directory = `public`.
6. Pastikan Functions directory = `netlify/functions`.
7. Tambahkan environment variables:
   - `DATABASE_URL` = PostgreSQL URI Supabase
   - `DATABASE_SSL` = `true`
8. Deploy.
9. Setelah deploy, buka URL site Netlify.
10. Uji backend dengan membuka `/api/health`. Hasil yang benar berupa JSON yang menunjukkan service TRENDOVA aktif.

Netlify Free saat ini tercantum sebagai $0 dan mencakup deploy, functions, dan global CDN. Perhatikan batas 300 credits/bulan pada plan Free dan jangan mengaktifkan auto recharge bila tujuanmu tetap Rp0.

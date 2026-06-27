# Как запушить репо

Распакуй архив, открой папку `askeladd/` в терминале и выполни:

```bash
git init
git add .
git commit -m "Askeladd — production multimodal Telegram AI assistant"
git branch -M main
```

Создай ПУСТОЙ публичный репозиторий на GitHub (без README/lLicense — они уже здесь),
назови его, например, `askeladd`. Затем привяжи и запушь:

```bash
git remote add origin https://github.com/<ТВОЙ-USERNAME>/askeladd.git
git push -u origin main
```

Замени `<ТВОЙ-USERNAME>` на свой ник на GitHub.

---

## Перед пушем — проверь сам (30 секунд)

Доверяй, но проверяй. Прогони это в папке репо — должно вывести `CLEAN`:

```bash
grep -rEn "94\.156|jsruru|5e8e4d92|askeladd-bot\.xyz|duckdns|407057124|6017125161|5567965581|8579905312|1003879265334" . || echo CLEAN
```

Если когда-нибудь добавишь сюда новые файлы (воркфлоу-JSON, скрины, конфиги) —
прогоняй этот grep ПЕРЕД коммитом. Утёкший секрет лечится ротацией ключа,
не удалением файла.

## Что осталось добавить руками (опционально)

- **Скрин n8n canvas** (WF2) в `docs/` — визуальный пруф инфраструктуры, ноль риска.
  Просто проверь что в кадре нет URL админки / IP.
- **Ссылку на репо** добавь в Upwork-профиль (Portfolio) и в one-pager для cold outreach.

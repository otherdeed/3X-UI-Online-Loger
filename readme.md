# 📊 3X-UI Онлайн Логер

Система мониторинга логов access 3x-ui в реальном времени. Позволяет просматривать логи через веб-интерфейс с авторизацией по паролю.

## 🏗 Архитектура
- **Frontend**: Nuxt 4 + Nuxt UI v3 (порт 3000)
- **Backend**: Node.js + Express + WebSocket (порт 3001)
- **Proxy**: Nginx (порт 80)
- **Auth**: JWT (JSON Web Token)

---

## 🛠 Установка и запуск

### 1. Бэкенд (Backend)
Находится в директории `/backend`.

1. Создайте файл `.env` на основе `.env.example`  

2. Установите зависимости и сборка:
   ```bash
   cd backend
   npm install
   npm run build
   ``` 

3. Запустите через PM2:
    ```bash
    pm2 start dist/index.js --name "log-backend"
    ```


### 1. Фронтенд (Frontend)
Находится в директории `/frontend`.

1. Создайте файл `.env` на основе `.env.example`

2. Установите зависимости и сборка:
   ```bash
   cd frontend
   npm install
   npm run build
   ``` 

3. Запустите через PM2:
    ```bash
    pm2 start .output/server/index.mjs --name "log-frontend"
    ```


## 🌐 Конфигурация Nginx    
1. Настройка nginx

    `sudo nano /etc/nginx/sites-available/log-monitor`
    ```bash
    server {
        listen 80;
        server_name your_ip_or_domain;

        # API Auth
        location /api/ {
            proxy_pass http://127.0.0.1:3001/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # WebSocket Logs
        location /ws-logs {
            proxy_pass http://127.0.0.1:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
            proxy_read_timeout 86400s;
        }

        # Nuxt UI Interface
        location /secret-monitor-777/ {
            proxy_pass http://127.0.0.1:3000/secret-monitor-777/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
        }
    }
    ```

2. Создаем символическую ссылку
    ```bash
    sudo ln -s /etc/nginx/sites-available/log-monitor /etc/nginx/sites-enabled/
    ```

3. Перезагружаем nginx

    ```bash
    sudo nginx -t
    sudo systemctl reload nginx
    ```


## Настройка 3X-IU
1. Заходим в 3X-UI / Настройки Xray / Логи
2. Находим логи доступа и выбираем `./access.log`
3. Сохраняем и перезапускаем Xray


## Настройка Logrotate
`sudo nano /etc/logrotate.d/3x-ui`
```bash
/usr/local/x-ui/access.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

## 🚀 Использование
1. Перейдите по адресу `http://your_ip/secret-monitor-777/auth`
2. Введите установленный пароль.
3. Система автоматически подключится к сокету и выведет последние 1000 строк лога + live-обновления.
---

![Xray monitor](https://i.postimg.cc/Xv79RPRj/Snimok-ekrana-2025-12-18-v-21-34-21.png)
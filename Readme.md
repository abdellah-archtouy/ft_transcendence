# 🏓 ft_transcendence: Real-time Multiplayer Pong

![Project Banner](https://img.shields.io/badge/ft__transcendence-Multiplayer%20Pong-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-active-success)

> _Experience the classic Pong game reimagined with modern web technologies and real-time multiplayer capabilities!_

## 🌟 Features

### 🎮 Game Features

- Real-time multiplayer Pong gameplay
- Matchmaking system
- Live score tracking
- Power-ups and special abilities
- Custom game rooms
- Tournament mode

### 💬 Social Features

- Real-time chat system
- Friend management
- User profiles
- Achievement system
- Global leaderboard

## 🏗️ System Architecture

### Container Architecture

```mermaid
graph TB
    subgraph "Docker Environment"
        subgraph "Frontend Container"
            R[React App]
            S[Serve Static Files]
        end

        subgraph "Backend Container"
            D[Daphne Server]
            DJ[Django App]
            WS[WebSocket Handler]
        end

        subgraph "Nginx Container"
            NC[Nginx Server]
            SSL[SSL Termination]
            PC[Proxy Controller]
        end

        subgraph "Database Container"
            PG[PostgreSQL]
        end

        NC --> |"Proxy HTTPS\n(443)"| D
        NC --> |"Serve Static\n(80/443)"| S
        R --> |"Build"| S
        D --> |"Handle Requests"| DJ
        D --> |"WebSocket\nConnections"| WS
        DJ --> |"Data\nOperations"| PG
        WS --> |"Real-time\nUpdates"| PG
    end

    User --> |"HTTPS/WSS"| NC
```

### Network Flow

```mermaid
sequenceDiagram
    participant U as User
    participant N as Nginx
    participant F as Frontend
    participant B as Backend
    participant DB as PostgreSQL

    U->>N: HTTPS Request
    alt Static Content
        N->>F: Request Static Files
        F->>N: Return Built Files
        N->>U: Serve Static Content
    else API Request
        N->>B: Proxy to Backend
        B->>DB: Database Query
        DB->>B: Query Result
        B->>N: API Response
        N->>U: Return Data
    else WebSocket
        U->>N: WS Connection
        N->>B: Proxy WS
        activate B
        Note over B: Keep Connection Alive
        B->>DB: Real-time Updates
        B->>N: WS Messages
        N->>U: Real-time Data
        deactivate B
    end
```

### SSL Certificate Management

```mermaid
graph LR
    subgraph "SSL Management"
        I[Initial Setup] -->|Generate| K[SSL Keys]
        K -->|Mount| N[Nginx]
        K -->|Mount| B[Backend]
        N -->|Terminate SSL| R[Requests]
        B -->|Internal SSL| W[WebSocket]
    end
```

### Volume Management

```mermaid
graph TB
    subgraph "Docker Volumes"
        NV[nginx_certs]
        FV[frontend_build]
        DV[database]

        subgraph "Mounted Locations"
            NV -->|"SSL Certs"| NC[Nginx Container]
            NV -->|"SSL Certs"| BC[Backend Container]
            FV -->|"Static Files"| NC
            DV -->|"Persistent Data"| PG[PostgreSQL Container]
        end
    end
```

### Request Flow

```mermaid
graph LR
    subgraph "Request Router"
        H[HTTPS Request] -->|443| N[Nginx]
        N -->|Static| S[Static Files]
        N -->|API| B[Backend API]
        N -->|WebSocket| W[WS Handler]
        N -->|Admin| A[Admin Panel]
        N -->|Media| M[Media Files]
    end
```

## 🛠️ Technical Stack

### Frontend Container (Node.js Alpine)

- React.js with TypeScript
- CSS for styling
- Socket.io client for real-time communication
- Production-optimized build
- Static file serving
- Environment variable support

### Backend Container (Python Slim)

- Django with Daphne server
- WebSocket support
- SSL certificate integration
- Automatic migrations
- PostgreSQL integration
- Real-time game state management

### Nginx Container

- SSL termination
- Reverse proxy
- Static file serving
- WebSocket proxy
- Media file handling
- Security optimizations

### Database Container (PostgreSQL)

- Persistent storage
- Environment configuration
- Automatic restart
- Data integrity
- Backup support

## 🎨 User Interface Gallery

### Landing Page

![Landing-Page](/images/landing%20Page.png)
![Landing-Page-2](</images/landing%20Page%20(1).png>)
![Landing-Page-2](</images/landing%20Page%20(2).png>)
![Landing-Page-2](</images/landing%20Page%20(3).png>)
_Clean Landing Page_

### Loading Animation

![Loading](/images/loading%20page.png)
_Clean Settings_

### Home Page

![Settings](/images/Home%20Page.png)
_Clean Home_

### Game Management

![Game](/images/Game%20Page.png)
![Game](</images/Game%20Page%20(1).png>)
![Game](</images/Game%20Page%20(2).png>)
![Game](</images/Game%20Page%20(3).png>)
![Game](</images/Game%20Page%20(4).png>)
![Game](</images/Game%20Page%20(5).png>)
_Clean Game Management_

### Chat Interface

![Chat](/images/chat.png)
![Chat](</images/chat%20(1).png>)
![Chat](</images/chat%20(2).png>)
_Clean Chat_

### Leaderboard

![Leaderboard](/images/LeaderBoard.png)
![Leaderboard](</images/LeaderBoard%20(1).png>)
_Clean leaderboard_

### Settings Panel

![Settings](/images/Settings.png)
_Clean Settings_

### Profile Page

![Profile](/images/profile.png)
![Profile](/images/Oprofile.png)
_Clean Profile_

## 🔒 Security Features

### SSL/TLS Configuration

- TLS 1.2 and 1.3 support
- Strong cipher suite configuration
- Automatic certificate generation
- Secure key permissions (644)

### Proxy Security

- Real IP forwarding
- XSS protection
- Secure headers
- Maximum body size limits

## 🚀 Scaling Considerations

1. **Horizontal Scaling**

   - Backend containers can be replicated
   - WebSocket connections are load-balanced
   - Static content is cached

2. **Performance Optimization**

   - Nginx caching for static files
   - Database connection pooling
   - WebSocket connection management

3. **Monitoring Points**
   - Container health checks
   - Database performance
   - WebSocket connection status
   - SSL certificate validity

## Color Palette

| Color      | Hex Code   | Usage                      |
| ---------- | ---------- | -------------------------- |
| Primary    | `#000000 ` | Main actions, buttons      |
| Secondary  | `#565656`  | Highlights, success states |
| Accent     | `#FF4242`  | Notifications, alerts      |
| Background | `#000000`  | Main background            |
| Text       | `#B0B0B0`  | Primary text               |

## 🏆 Achievement System

- 🎮 First Match
- 🏅 Tournament Victor
- 💫 Perfect Game
- 🌟 Community Legend
- 🔥 Win Streak Master

## 💡 Development Philosophy

Our project embraces:

- Clean, maintainable code
- Responsive design
- Real-time performance
- Scalable architecture
- User-centered design

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
    <p>Made with ❤️ by the ft_transcendence team</p>
    <p>© 2025 ft_transcendence. All rights reserved.</p>
</div>

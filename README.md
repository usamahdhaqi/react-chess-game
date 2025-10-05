
# ♟️ Modern Chess Game

![Stars](https://img.shields.io/github/stars/usamahdhaqi/react-chess-game?style=social)
![License](https://img.shields.io/github/license/usamahdhaqi/react-chess-game)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![npm](https://img.shields.io/badge/npm-v9.6.7-CB3837?logo=npm)
![chess.js](https://img.shields.io/badge/chess.js-latest-blue)
![react-chessboard](https://img.shields.io/badge/react--chessboard-2.x-green)

> 🧠 A modern, interactive chess game built with **React**, powered by a simple yet strategic **AI opponent** and an elegant **UI theme** in shades of lavender and violet.

---

## 🖼️ Preview

<p align="center">
  <img src="https://via.placeholder.com/900x500.png?text=Modern+Chess+Game+Preview" alt="Modern Chess Game Screenshot" width="85%">
</p>

---

## ✨ Fitur Utama

- 🎨 **Tampilan Modern & Responsif**  
  Desain clean dengan kombinasi warna ungu lembut (`#D0BFFF`, `#BEADFA`, `#DFCCFB`) dan efek bayangan halus.  

- 🧩 **Click-to-Move System**  
  Gerakkan bidak cukup dengan klik asal dan tujuan — tanpa drag & drop yang ribet.

- 💡 **Smart Highlight System**  
  - Kotak asal: ungu gelap  
  - Kotak target kosong: ungu muda  
  - Target berisi bidak lawan: merah transparan  
  - Langkah terakhir: kuning lembut  

- 🤖 **Built-in Chess AI**  
  - **Easy** → langkah acak  
  - **Medium** → algoritma *Minimax Depth 1*  
  - **Hard** → evaluasi skor posisi lebih dalam  
  AI bermain otomatis setelah giliran pemain selesai.

- 🔄 **Flip Board**  
  Tukar posisi papan (Putih ↔ Hitam) kapan saja.

- 🕹️ **Game Controls Lengkap**  
  - Ganti tingkat kesulitan  
  - Reset permainan  
  - Ubah orientasi papan  

- 📜 **Riwayat Langkah (Move History)**  
  Menampilkan seluruh langkah dalam format notasi standar SAN (`e4`, `Nf3`, `Bb5`, dll).

---

## 🧠 AI Logic (Simplified)

AI dalam game ini menggunakan pendekatan **material evaluation**, di mana nilai tiap bidak ditentukan sebagai berikut:

| Bidak | Nilai |
|:------:|:------:|
| ♙ Pawn | 1 |
| ♘ Knight | 3 |
| ♗ Bishop | 3 |
| ♖ Rook | 5 |
| ♕ Queen | 9 |
| ♔ King | 0 |

Untuk tingkat *Medium* dan *Hard*, sistem akan mengevaluasi langkah yang paling menguntungkan atau paling merugikan bagi pemain lawan berdasarkan skor posisi.

---

## 🧩 Struktur Proyek

```
modern-chess-game/
│
├── src/
│   ├── App.js                # Komponen utama & logika permainan
│   ├── App.css               # Styling modern & responsif
│   ├── components/
│   │   ├── ChessboardWrapper.js  # Tampilan papan catur
│   │   ├── GameControls.js       # Tombol & pengaturan kesulitan
│   │   ├── GameStatus.js         # Status permainan (giliran, checkmate, dll)
│   │   ├── MoveHistory.js        # Riwayat langkah
│   │
│   └── ...
│
├── package.json
└── README.md
```

---

## ⚙️ Cara Instalasi & Menjalankan

### 1️⃣ Clone Repository
```bash
git clone https://github.com/usamahdhaqi/react-chess-game.git
cd modern-chess-game
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Jalankan Aplikasi
```bash
npm start
```

Akses di browser:
```
http://localhost:3000
```

---

## 🖌️ Warna & Desain

| Elemen | Warna | Keterangan |
|:--------|:---------|:-------------|
| Dark Square | `#BEADFA` | Ungu pastel |
| Light Square | `#DFCCFB` | Ungu muda |
| Background | `linear-gradient(135deg, #D0BFFF, #DFCCFB)` | Gradasi lembut |
| Tombol utama | `#BEADFA` | Dengan hover efek elegan |
| Font | `Inter` / `Segoe UI` | Modern sans-serif |

---

## 📱 Responsiveness

Desain otomatis menyesuaikan:
- 🖥️ **Desktop:** Tampilan penuh dengan layout berdampingan  
- 📱 **Mobile:** Komponen disusun vertikal  
- 💡 Optimal di berbagai ukuran layar berkat media queries di `App.css`

---

## 💬 Cara Bermain

1. Klik bidakmu untuk menampilkan highlight langkah yang valid.  
2. Klik kotak tujuan untuk memindahkan bidak.  
3. Tunggu giliran AI bergerak otomatis.  
4. Ubah kesulitan atau reset kapan pun.  
5. Coba main sebagai Hitam dengan menekan tombol **Flip Board**.

---

## 🧰 Teknologi yang Digunakan

| Library | Fungsi |
|----------|---------|
| [React.js](https://react.dev) | Framework UI utama |
| [chess.js](https://github.com/jhlywa/chess.js) | Logika dan aturan catur |
| [react-chessboard](https://www.npmjs.com/package/react-chessboard) | Papan catur interaktif |
| [Tailwind CSS (opsional)](https://tailwindcss.com/) | Untuk tambahan styling cepat |

---

## 🚀 Pengembangan Selanjutnya

- 🔁 Mode dua pemain (Player vs Player)  
- 🌐 Mode online real-time dengan WebSocket  
- 🧮 AI dengan algoritma *Minimax + Alpha-Beta Pruning*  
- 🎵 Efek suara saat langkah & capture  
- 💾 Penyimpanan lokal (LocalStorage) untuk melanjutkan permainan  

---

## 📄 Lisensi

Distribusikan dan modifikasi proyek ini di bawah lisensi MIT.

```
MIT License © 2025 usamahdhaqi
```

---

## ❤️ Kontribusi

1. Fork repo ini  
2. Buat branch baru (`feature/fitur-baru`)  
3. Commit perubahan (`git commit -m "Add fitur baru"`)  
4. Push branch  
5. Ajukan Pull Request 🚀  

---

<p align="center">
  Dibuat dengan 💜 menggunakan React & chess.js  
  <br>
  <b>#PlaySmart #ThinkDeep #ReactChess</b>
</p>

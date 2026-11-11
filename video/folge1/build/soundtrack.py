# Synthesizes an original 60 s soundtrack (music + sound effects) -> assets/soundtrack.wav
import numpy as np, wave, os

SR = 44100
DUR = 60.0
N = int(SR * DUR)
t_all = np.arange(N) / SR
out = np.zeros(N)
rng = np.random.default_rng(7)


def place(sig, at, gain=1.0):
    i = int(at * SR)
    j = min(N, i + len(sig))
    out[i:j] += sig[: j - i] * gain


def env(n, a=0.01, r=0.3):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def tone(freqs, dur, a=0.01, r=0.3, decay=None):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) for f in freqs) / len(freqs)
    if decay:
        s *= np.exp(-t / decay)
    return s * env(n, a, r)


# ---- music: soft minor pad + piano-like plucks, Am - F - C - G, 2.5 s per chord
chords = [
    [220.0, 261.63, 329.63], [174.61, 220.0, 261.63],
    [196.0, 261.63, 329.63], [196.0, 246.94, 293.66],
]
music = np.zeros(N)
seg = 2.5
for k in range(int(DUR / seg)):
    st = k * seg
    ch = chords[k % 4]
    pad = tone([f / 2 for f in ch] + ch, seg + 0.6, a=0.6, r=0.8)
    pad *= 1 + 0.15 * np.sin(2 * np.pi * 0.5 * np.arange(len(pad)) / SR)
    i = int(st * SR)
    j = min(N, i + len(pad))
    music[i:j] += pad[: j - i] * 0.16
    for m, f in enumerate([ch[0] * 2, ch[1] * 2, ch[2] * 2, ch[1] * 2]):
        p = tone([f, f * 2.0], 1.2, a=0.005, r=0.3, decay=0.35)
        i = int((st + m * 0.625) * SR)
        j = min(N, i + len(p))
        music[i:j] += p[: j - i] * 0.10

# soft kick pulse from 15 s (tension)
for b in np.arange(15.0, 40.0, 0.625):
    n = int(0.3 * SR); tt = np.arange(n) / SR
    k = np.sin(2 * np.pi * (60 + 80 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 12)
    i = int(b * SR); music[i:i + n] += k * 0.22

# music automation: full until 40 s, silence 40-45 (heartbeat only), quieter 45-55, out at 55.1
gain = np.ones(N)
def ramp(a, b, g0, g1):
    i, j = int(a * SR), int(b * SR)
    gain[i:j] = np.linspace(g0, g1, j - i)
gain[: int(0.0 * SR)] = 1
ramp(39.6, 40.0, 1, 0); gain[int(40.0 * SR): int(45.0 * SR)] = 0
ramp(45.0, 46.0, 0, 0.55); gain[int(46.0 * SR): int(54.8 * SR)] = 0.55
ramp(54.8, 55.1, 0.55, 0); gain[int(55.1 * SR):] = 0
import json
VO = json.load(open(os.path.join(os.path.dirname(__file__), "voices.json")))
voice = np.zeros(N); active = np.zeros(N)
for v in VO:
    with wave.open(os.path.join(os.path.dirname(__file__), "..", v["file"])) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
    x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    x = x / max(1e-9, np.max(np.abs(x))) * 0.95
    i = int(v["start"] * SR); j = min(N, i + len(x))
    voice[i:j] += x[: j - i]
    active[max(0, i - int(0.25 * SR)): min(N, j + int(0.35 * SR))] = 1
k = int(0.15 * SR); active = np.convolve(active, np.ones(k) / k, mode="same")
out += music * gain * (1 - 0.6 * active) * 0.8

# ---- sfx
ping = tone([1318.5, 2637], 0.25, a=0.002, r=0.1, decay=0.12)
ping2 = tone([1760, 3520], 0.35, a=0.002, r=0.15, decay=0.18)
place(ping, 0.5, 0.5); place(ping2, 0.68, 0.5)           # S1 message
place(ping, 5.4, 0.35)                                    # S2 photo
place(ping, 6.2, 0.35)                                    # S2 voice msg
place(ping, 51.6, 0.5); place(ping2, 51.78, 0.5)         # S11 notification

def whoosh(dur=0.6):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = np.convolve(x, np.ones(30) / 30, mode="same")
    return x * np.sin(np.pi * tt / dur) ** 2
place(whoosh(), 9.7, 0.9)        # into street
place(whoosh(0.5), 14.8, 0.7)    # into store
place(whoosh(0.4), 50.7, 0.8)    # phone up

# steps on the street 10-15
for s in np.arange(10.1, 15.0, 0.5):
    n = int(0.08 * SR); tt = np.arange(n) / SR
    place(rng.standard_normal(n) * np.exp(-tt * 60), s, 0.25)

# door bell 20.15
bell = tone([2093, 2637, 3136], 1.6, a=0.003, r=0.4, decay=0.5)
place(bell, 20.15, 0.4); place(bell, 20.35, 0.3)

# hit on "WAS MACHST DU HIER" 25.2 and "WER IST DIE" 30.3
def hit(dur=0.9):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (45 + 60 * np.exp(-tt * 20)) * tt) * np.exp(-tt * 4)
    s += rng.standard_normal(n) * np.exp(-tt * 25) * 0.3
    return s
place(hit(), 25.2, 0.7); place(hit(), 30.3, 0.6)

# heartbeat 40-45
for b in np.arange(40.3, 45.0, 0.85):
    n = int(0.25 * SR); tt = np.arange(n) / SR
    h = np.sin(2 * np.pi * 50 * tt) * np.exp(-tt * 18)
    place(h, b, 0.8); place(h, b + 0.18, 0.55)

# sparkle on ring 45.4
place(tone([2637, 3951, 5274], 1.2, a=0.002, r=0.5, decay=0.4), 45.4, 0.2)

# boom + sting at end card 58.3
place(hit(1.6), 58.3, 1.0)
place(tone([220, 261.63, 311.13], 1.6, a=0.01, r=0.8), 58.3, 0.25)

out = out * 0.55 + voice * 0.9
# normalize
out = out / max(1e-9, np.max(np.abs(out))) * 0.89
pcm = (out * 32767).astype(np.int16)
stereo = np.repeat(pcm[:, None], 2, axis=1)
path = os.path.join(os.path.dirname(__file__), "..", "assets", "soundtrack.wav")
os.makedirs(os.path.dirname(path), exist_ok=True)
with wave.open(path, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print("wrote", path)

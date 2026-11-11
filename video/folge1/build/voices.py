# Generates German voice lines with Piper (local, free) + mouth envelopes -> assets/vo/*.wav, build/voices.json
import subprocess, json, wave, os, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
V = {"emir": "de_DE-thorsten-high", "lara": "de_DE-kerstin-low", "mila": "de_DE-ramona-low", "sophie": "de_DE-eva_k-x_low"}
LEN = {"emir": 1.0, "lara": 0.92, "mila": 0.95, "sophie": 0.9}
# (start in film seconds, speaker, scene, char prefix or None, text)
LINES = [
    (0.9, "lara", "s1", "s1-lara", "Nein … das kann nicht sein."),
    (5.6, "mila", "s2", None, "Lara! Ist das nicht dein Emir? Goethestraße, jetzt gerade."),
    (10.4, "lara", "s3", "s3-lara", "Er hat gesagt, er ist beim Training!"),
    (15.5, "sophie", "s4", "s4-sophie", "Der hier! Sie wird ausrasten."),
    (20.9, "lara", "s5", "s5-lara", "Emir."),
    (25.5, "emir", "s6", "s6-emir", "Lara?! Was machst du hier?"),
    (30.4, "lara", "s7", "s7-lara", "Wer ist die?!"),
    (35.4, "sophie", "s8", "s8-sophie", "Hi … ich bin Sophie. Seine Schwester."),
    (41.0, "lara", "s9", "s9-lara", "Seine … Schwester?"),
    (45.5, "emir", "s10", "s10-emir", "Der war für Samstag. Ich wollte dich fragen."),
    (55.4, "emir", "s12", "s12-emir", "Lara … was ist letzten Samstag passiert?"),
]
os.makedirs(os.path.join(ROOT, "assets", "vo"), exist_ok=True)
out = []
for i, (st, who, scene, pref, text) in enumerate(LINES):
    f = os.path.join(ROOT, "assets", "vo", f"line{i:02d}.wav")
    subprocess.run(["piper", "-m", os.path.join(HERE, "voices", V[who] + ".onnx"), "-f", f, "--length-scale", str(LEN[who]), "--sentence-silence", "0.1"],
                   input=text.encode(), check=True, capture_output=True)
    with wave.open(f) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
    dur = len(x) / sr
    hop = sr // 15
    env = [float(np.sqrt(np.mean(x[k:k + hop] ** 2))) for k in range(0, len(x), hop)]
    m = max(env) or 1
    env = [round(min(1, e / m * 1.3), 2) for e in env]
    out.append({"i": i, "start": st, "who": who, "scene": scene, "pref": pref, "text": text, "file": f"assets/vo/line{i:02d}.wav", "sr": sr, "dur": round(dur, 2), "env": env})
    print(i, who, round(dur, 2), text)
json.dump(out, open(os.path.join(HERE, "voices.json"), "w"), ensure_ascii=False, indent=1)

import speech_recognition as sr
import wave
import pyaudio

def record_audio():
    CHUNK = 1024
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 16000
    RECORD_SECONDS = 5
    WAVE_OUTPUT_FILENAME = "audio_file.wav"

    audio = pyaudio.PyAudio()

    print("Запись аудио...")

    stream = audio.open(format=FORMAT,
                        channels=CHANNELS,
                        rate=RATE,
                        input=True,
                        frames_per_buffer=CHUNK)

    frames = []

    for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)

    print("Запись завершена.")

    stream.stop_stream()
    stream.close()
    audio.terminate()

    wf = wave.open(WAVE_OUTPUT_FILENAME, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(audio.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))
    wf.close()

def recognize_speech():
    # Создание объекта Recognizer
    r = sr.Recognizer()

    # Загрузка аудиофайла
    audio_file = "audio_file.wav"
    with sr.AudioFile(audio_file) as source:
        audio = r.record(source)  # Чтение аудиофайла

    # Распознавание речи
    try:
        text = r.recognize_google(audio, language="ru-RU")  # Распознавание на русском языке с использованием Google Speech Recognition
        print("Распознанный текст:", text)
    except sr.UnknownValueError:
        print("Не удалось распознать речь")
    except sr.RequestError as e:
        print("Ошибка сервиса распознавания речи: {0}".format(e))

# Запись аудио через микрофон и сохранение в файл
record_audio()

# Вызов функции распознавания речи
recognize_speech()

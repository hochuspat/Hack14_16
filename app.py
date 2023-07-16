import speech_recognition as sr
import wave
import pyaudio
import re
from datetime import datetime
from dateutil.parser import parse
import dateparser
def record_audio():
    CHUNK = 1024
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 16000
    RECORD_SECONDS = 10
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

def find_city(text):
    # Список городов России для поиска
    cities = ["москва", "санкт-петербург", "новосибирск", "екатеринбург", "казань", "нижний Новгород", "челябинск", "адлер"]
    
    # Переменные для хранения найденных городов
    first_city = None
    second_city = None

    # Поиск городов в тексте по списку
    for city in cities:
        if city in text:
            # Если первый город еще не найден, то записать его
            if not first_city:
                first_city = city
            # Если первый город уже найден, то записать второй город и выйти из цикла
            else:
                second_city = city
                break
    
    # Вернуть кортеж из двух городов или None, если не найдено
    return (first_city, second_city)

def find_date(text):
    # Regular expression for flexible date matching
    date_pattern = r"\b\d{1,2}[./-]?\s?\b(?:январ(?:я|ь)|феврал(?:я|ь)|март(?:а)?|апрел(?:я)?|ма(?:я)?|июн(?:я|ь)|июл(?:я|ь)|августа?|сентябр(?:я|ь)|октябр(?:я|ь)|ноябр(?:я|ь)|декабр(?:я|ь))\b[./-]?\s?\b\d{4}\b"

    # Search for the date in the text using the regular expression
    match = re.search(date_pattern, text, re.IGNORECASE)

    # If a date is found, parse it using dateparser and return it
    if match:
        date_str = match.group().replace("-", ".").replace(" ", ".").replace("январ", "01").replace("феврал", "02").replace("март", "03").replace("апрел", "04").replace("май", "05").replace("июн", "06").replace("июл", "07").replace("август", "08").replace("сентябр", "09").replace("октябр", "10").replace("ноябр", "11").replace("декабр", "12")
        return dateparser.parse(date_str, languages=['ru'], date_formats=['%d.%m.%Y'])

    return None


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

        # Вызов функции поиска городов
        first_city, second_city = find_city(text)

        # Вызов функции поиска даты
        date = find_date(text)

        # Вывод результатов
        print("Город отправления:", first_city or "не найден")
        print("Город прибытия:", second_city or "не найден")
        print("Дата:", date.strftime("%d.%m.%Y") if date else "не найдена")

    except sr.UnknownValueError:
        print("Не удалось распознать речь")
    except sr.RequestError as e:
        print("Ошибка сервиса распознавания речи: {0}".format(e))

# Запись аудио через микрофон и сохранение в файл
record_audio()

# Вызов функции распознавания речи
recognize_speech()


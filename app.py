from flask import Flask, request, jsonify, send_from_directory
import speech_recognition as sr
import os
import pydub

# Specify the path to ffprobe executable
pydub.AudioSegment.converter = "path/to/ffprobe"

app = Flask(__name__, static_url_path='')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/recognize', methods=['POST'])
def recognize_audio():
    # Получение аудио из запроса
    audio_file = request.files.get('uri')
    if audio_file is None:
        return jsonify({'error': 'No audio file received'}), 400

    # Сохранение аудио на сервере
    audio_file.save('audio_file_received')

    # Конвертация аудио в WAV (in case it's not already in WAV format)
    audio = pydub.AudioSegment.from_file('audio_file_received')
    audio.export('audio_file.wav', format='wav')

    # Удаление временного raw файла
    os.remove('audio_file_received')

    # Распознавание речи
    text = recognize_speech()

    return jsonify({'result': text}), 200

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
        return text
    except sr.UnknownValueError:
        return "Не удалось распознать речь"
    except sr.RequestError as e:
        return "Ошибка сервиса распознавания речи: {0}".format(e)

# Запуск сервера Flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


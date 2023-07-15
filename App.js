import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import { VictoryChart, VictoryLine, VictoryAxis } from 'victory-native';
const App = () => {
  const today = new Date().toLocaleDateString();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [stops, setStops] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [ticketBought, setTicketBought] = useState(false);
  const [updateChart, setUpdateChart] = useState(false);
  const [buyButtonPressed, setBuyButtonPressed] = useState(false);

  const swapFields = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const toggleCalendar = () => {
    setCalendarVisible(!calendarVisible);
  };

  const fetchTrains = () => {
    const url = 'http://10.1.0.244:3000/trains';
    const params = {
      origin,
      destination,
      date: selectedDate,
    };

    const queryString = Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    const fetchUrl = `${url}?${queryString}`;

    fetch(fetchUrl)
      .then((response) => response.json())
      .then((trains) => {
        console.log(trains);
        setTrains(trains);
        setSelectedTrain(null);
        setShowSchedule(false);
      })
      .catch((error) => {
        console.error('Ошибка выполнения запроса:', error);
      });
  };

  const fetchStops = (trainId) => {
    const url = `http://10.1.0.244:3000/stops?trainId=${trainId}`;

    fetch(url)
      .then((response) => response.json())
      .then((stops) => {
        console.log(stops);
        setStops(stops);
      })
      .catch((error) => {
        console.error('Ошибка выполнения запроса:', error);
      });
  };

  const fetchChartData = () => {
    const url = 'http://10.1.0.244:3000/purchases';

    fetch(url)
      .then((response) => response.json())
      .then((chartData) => {
        setChartData(chartData);
        setUpdateChart(false);
      })
      .catch((error) => {
        console.error('Ошибка выполнения запроса:', error);
      });
  };
  const openSchedule = (train) => {
    setSelectedTrain(train);
    setChartData([]);
    fetchStops(train.id);
    setShowSchedule(true);
    setBuyButtonPressed(false); // Добавьте эту строку
  };
  


  const closeSchedule = () => {
    setShowSchedule(false);
  };

  const buyTicket = () => {
    if (selectedTrain) {
      const purchaseTime = new Date().toISOString();
   
      // Отправляем данные на сервер
      fetch('http://10.1.0.244:3000/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purchaseTime,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Data saved successfully:', data);
          setTicketBought(true);
          fetchChartData(); // Запрос обновленных данных для графика
          setBuyButtonPressed(true); // Устанавливаем флаг, что кнопка была нажата
          Alert.alert('Покупка билета', 'Вы успешно приобрели билет');
        })
        .catch((error) => {
          console.error('Error saving data:', error);
          Alert.alert('Ошибка', 'Не удалось сохранить данные');
        });
    } else {
      Alert.alert('Ошибка', 'Выберите поезд');
    }
  };
  

  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView>
        <View style={{ backgroundColor: '#EF3026' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
              height: 85,
              flexShrink: 0,
              marginTop: 20,
            }}
          >
            <TouchableOpacity>
              <Icon name="menu" size={40} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>
              Войти
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity>
                <Icon name="settings" size={30} color="#FFFFFF" style={{ marginRight: 10 }} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon name="basket" size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: '#FFFFFF', padding: 20 }}>
          <Text style={{ color: '#000000', fontSize: 16, marginBottom: 8 }}>Откуда</Text>
          <TextInput
            style={{ borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 16 }}
            value={origin}
            onChangeText={(text) => setOrigin(text)}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <TouchableOpacity onPress={swapFields}>
              <Icon name="arrow-up" size={20} color="#A8D4A4" style={{ marginRight: 5 }} />
              <Icon name="arrow-down" size={20} color="#A8D4A4" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: '#000000', fontSize: 16, marginBottom: 8 }}>Куда</Text>
          <TextInput
            style={{ borderWidth: 1, borderRadius: 5, paddingHorizontal: 10 }}
            value={destination}
            onChangeText={(text) => setDestination(text)}
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#FFFFFF',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginTop: 20,
          }}
          onPress={toggleCalendar}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="calendar" size={20} color="#000000" style={{ marginRight: 10 }} />
            <Text style={{ color: '#000000', fontSize: 16 }}>{selectedDate}</Text>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: '#EF3026', borderRadius: 5, paddingHorizontal: 10, paddingVertical: 5 }}
            onPress={fetchTrains}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Найти поезда</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {calendarVisible && (
          <View style={{ backgroundColor: '#FFFFFF', padding: 20 }}>
            <Calendar
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: 'blue',
                },
              }}
              onDayPress={onDayPress}
            />
          </View>
        )}

        {/* Отображение карточек поездов */}
        <View style={{ padding: 20 }}>
          {trains.map((train) => (
            <View key={train.id} style={{ backgroundColor: '#EFEFEF', borderRadius: 10, marginBottom: 10, padding: 10 }}>
              <Text>Отправление: {train.origin}</Text>
              <Text>Прибытие: {train.destination}</Text>
              <Text>Дата: {train.date}</Text>
              <Text>Время отправления: {train.departure_time}</Text>
              <Text>Время прибытия: {train.arrival_time}</Text>
              {buyButtonPressed && (
  <VictoryChart>
    <VictoryAxis
      dependentAxis
      tickFormat={(tick) => `${tick}h`}
      style={{
        axis: { stroke: 'gray' },
        ticks: { stroke: 'gray', size: 5 },
        tickLabels: { fontSize: 10, padding: 5 },
      }}
    />
    <VictoryAxis
      tickFormat={(date) => new Date(date).toLocaleDateString()}
      tickValues={chartData.map((d) => Date.parse(d.x))}
    />

    <VictoryLine
      data={chartData}
      x="x"
      y="y"
      style={{
        data: { stroke: 'blue' },
      }}
    />
  </VictoryChart>
)}
              {/* Остальной код карточки поезда */}

              <TouchableOpacity
                style={{ marginTop: 10, backgroundColor: '#EF3026', borderRadius: 5, padding: 5 }}
                onPress={() => openSchedule(train)}
              >
                <Text style={{ color: '#FFFFFF' }}>Маршрут</Text>
              </TouchableOpacity>
              {ticketBought ? (
                <Text style={{ marginTop: 10, fontWeight: 'bold', textAlign: 'center' }}>Вы приобрели билет</Text>
              ) : (
                <TouchableOpacity
                  style={{ marginTop: 10, backgroundColor: '#EF3026', borderRadius: 5, padding: 5 }}
                  onPress={buyTicket}
                >
                  <Text style={{ color: '#FFFFFF' }}>Купить</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <Modal visible={showSchedule} animationType="slide">
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 20 }}>
            {/* Расписание станций */}
            <Text>Расписание станций для поезда {selectedTrain?.id}</Text>

            {/* Заголовки таблицы */}
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeader}>Номер остановки</Text>
              <Text style={styles.tableHeader}>Название остановки</Text>
              <Text style={styles.tableHeader}>Время прибытия</Text>
              <Text style={styles.tableHeader}>Длительность остановки</Text>
              <Text style={styles.tableHeader}>Время отправления</Text>
              {/* Другие заголовки таблицы */}
            </View>

            {/* Таблица с данными остановок */}
            <ScrollView style={styles.tableContainer}>
              {stops.map((stop) => (
                <View key={stop.stop_id} style={styles.tableRow}>
                  <Text style={styles.tableData}>{stop.stop_number}</Text>
                  <Text style={styles.tableData}>{stop.stop_name}</Text>
                  <Text style={styles.tableData}>{stop.arrival_time || 'Не указано'}</Text>
                  <Text style={styles.tableData}>{stop.stop_duration || 'Не указано'}</Text>
                  <Text style={styles.tableData}>{stop.departure_time || 'Не указано'}</Text>
                  {/* Другие данные остановки */}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={{ marginTop: 10, backgroundColor: '#EF3026', borderRadius: 5, padding: 5 }}
              onPress={closeSchedule}
            >
              <Text style={{ color: '#FFFFFF' }}>Свернуть</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#EF3026',
          borderRadius: 20,
          width: 60,
          height: 60,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon name="mic" size={30} color="#FFFFFF" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  tableHeader: {
    flex: 1,
    fontWeight: 'bold',
  },
  tableContainer: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  tableData: {
    flex: 1,
  },
});

export default App;
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let rooms = [];
let bookings = [];
let customers = [];

app.post('/rooms', (req, res) => {
    const { name, seats, amenities, pricePerHour } = req.body;
    const newRoom = {
        id: rooms.length + 1,
        name,
        seats,
        amenities,
        pricePerHour,
        bookings: []
    };
    rooms.push(newRoom);
    res.status(201).json(newRoom);
});

app.post('/rooms/:roomId/book', (req, res) => {
    const { roomId } = req.params;
    const { customerName, date, startTime, endTime } = req.body;

    const room = rooms.find(r => r.id === parseInt(roomId));
    if (!room) return res.status(404).send("Room not found.");

    const isAvailable = room.bookings.every(booking => {
        return booking.date !== date || (endTime <= booking.startTime || startTime >= booking.endTime);
    });

    if (!isAvailable) return res.status(400).send("Room is already booked for the specified time.");

    const booking = {
        id: bookings.length + 1,
        customerName,
        date,
        startTime,
        endTime,
        roomId: room.id
    };
    room.bookings.push(booking);
    bookings.push(booking);

    const customer = customers.find(c => c.name === customerName) || { name: customerName, bookings: [] };
    customer.bookings.push(booking);
    if (!customers.includes(customer)) customers.push(customer);

    res.status(201).json(booking);
});

app.get('/rooms', (req, res) => {
    const roomsWithBookings = rooms.map(room => ({
        ...room,
        bookings: room.bookings.map(b => ({
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            customerName: b.customerName
        }))
    }));
    res.json(roomsWithBookings);
});

app.get('/customers', (req, res) => {
    const customersWithBookings = customers.map(customer => ({
        name: customer.name,
        bookings: customer.bookings.map(b => ({
            roomName: rooms.find(room => room.id === b.roomId).name,
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime
        }))
    }));
    res.json(customersWithBookings);
});

app.get('/customers/:name/bookings', (req, res) => {
    const { name } = req.params;
    const customer = customers.find(c => c.name === name);
    if (!customer) return res.status(404).send("Customer not found.");

    const bookingCount = customer.bookings.length;
    res.json({ customerName: name, bookingCount });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

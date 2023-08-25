const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql');
const fs = require('fs');
const app = express();
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'contact_list',
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to the database');
    }
});

// Set up multer for file uploads (images)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
// const upload = multer({ storage });

// Create New Contact (POST /contacts):
app.post('/contacts', (req, res) => {
    const { name, phoneNumbers, image } = req.body;

    // Check for duplicate phone numbers before creating the contact
    const duplicatePhoneNumbers = phoneNumbers.filter((number) => {
        // Implement your query to check for duplicate phone numbers
        // Return the number if it's found in the database
    });

    if (duplicatePhoneNumbers.length > 0) {
        return res.status(400).json({ message: 'Duplicate phone numbers found' });
    }

    // Insert the contact data into the contacts table
    const insertContactQuery = `INSERT INTO contacts (name, image) VALUES (?, ?)`;
    const contactValues = [name, image];

    db.query(insertContactQuery, contactValues, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error creating contact' });
        }

        const contactId = result.insertId;

        // Insert phone numbers into the phone_numbers table
        const insertPhoneNumbersQuery = `INSERT INTO phone_numbers (contact_id, phone_number) VALUES ?`;
        const phoneNumberValues = phoneNumbers.map((number) => [contactId, number]);

        db.query(insertPhoneNumbersQuery, [phoneNumberValues], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error creating phone numbers' });
            }

            return res.status(201).json({ message: 'Contact created successfully' });
        });
    });
});

//Delete Contact (DELETE /contacts/:id):

app.delete('/contacts/:id', (req, res) => {
    const contactId = req.params.id;

    // Delete contact from contacts table
    const deleteContactQuery = `DELETE FROM contacts WHERE id = ?`;

    db.query(deleteContactQuery, contactId, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting contact' });
        }

        // Delete associated phone numbers from phone_numbers table
        const deletePhoneNumbersQuery = `DELETE FROM phone_numbers WHERE contact_id = ?`;

        db.query(deletePhoneNumbersQuery, contactId, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting phone numbers' });
            }

            return res.status(200).json({ message: 'Contact deleted successfully' });
        });
    });
});


//Fetch All Contacts (GET /contacts):

app.get('/contacts', (req, res) => {
    // Fetch all contacts with their associated phone numbers
    const fetchContactsQuery = `
    SELECT c.id, c.name, c.image, GROUP_CONCAT(p.phone_number) AS phone_numbers
    FROM contacts c
    LEFT JOIN phone_numbers p ON c.id = p.contact_id
    GROUP BY c.id
  `;

    db.query(fetchContactsQuery, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching contacts' });
        }

        return res.status(200).json(results);
    });
});

//Search Contacts (GET /contacts/search):

app.get('/contacts/search', (req, res) => {
    const searchQuery = req.query.query;

    // Search for contacts by name or phone number
    const searchContactsQuery = `
    SELECT c.id, c.name, c.image, GROUP_CONCAT(p.phone_number) AS phone_numbers
    FROM contacts c
    LEFT JOIN phone_numbers p ON c.id = p.contact_id
    WHERE c.name LIKE ? OR p.phone_number LIKE ?
    GROUP BY c.id
  `;

    const searchTerm = `%${searchQuery}%`;

    db.query(searchContactsQuery, [searchTerm, searchTerm], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error searching contacts' });
        }

        return res.status(200).json(results);
    });
});

//Define the Export Route:

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Define the /contacts/export route
app.get('/contacts/export', (req, res) => {
    // Fetch contacts from the database
    const fetchContactsQuery = `
    SELECT c.id, c.name, c.image, GROUP_CONCAT(p.phone_number) AS phone_numbers
    FROM contacts c
    LEFT JOIN phone_numbers p ON c.id = p.contact_id
    GROUP BY c.id
  `;

    db.query(fetchContactsQuery, (err, results) => {
        if (err) {
            console.error('Error fetching contacts:', err);
            return res.status(500).json({ message: 'Error fetching contacts' });
        }

        // Create a CSV writer
        const csvWriter = createCsvWriter({
            path: 'contacts.csv',
            header: [
                { id: 'id', title: 'ID' },
                { id: 'name', title: 'Name' },
                { id: 'image', title: 'Image' },
                { id: 'phone_numbers', title: 'Phone Numbers' }
            ]
        });

        // Transform the fetched data to match the CSV format
        const data = results.map(contact => ({
            id: contact.id,
            name: contact.name,
            image: contact.image,
            phone_numbers: contact.phone_numbers
        }));

        // Write data to CSV file
        csvWriter.writeRecords(data)
            .then(() => {
                // Set response headers
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');

                // Stream the CSV file as the response
                const fileStream = fs.createReadStream('contacts.csv');
                fileStream.pipe(res);
            })
            .catch(error => {
                console.error('Error exporting contacts to CSV:', error);
                return res.status(500).json({ message: 'Error exporting contacts to CSV' });
            });
    });
});
//update

// Update Contact
app.put('/contacts/:id', (req, res) => {
    const contactId = req.params.id;
    const { name, phoneNumbers, image } = req.body;

    // Update contact in the contacts table
    const updateContactQuery = `UPDATE contacts SET name = ?, image = ? WHERE id = ?`;
    const contactValues = [name, image, contactId];

    db.query(updateContactQuery, contactValues, (err, result) => {
        if (err) {
            console.error('Error updating contact:', err);
            return res.status(500).json({ message: 'Error updating contact' });
        }

        // Update phone numbers in the phone_numbers table
        const deletePhoneNumbersQuery = `DELETE FROM phone_numbers WHERE contact_id = ?`;

        db.query(deletePhoneNumbersQuery, contactId, (err) => {
            if (err) {
                console.error('Error deleting phone numbers:', err);
                return res.status(500).json({ message: 'Error updating phone numbers' });
            }

            const insertPhoneNumbersQuery = `INSERT INTO phone_numbers (contact_id, phone_number) VALUES ?`;
            const phoneNumberValues = phoneNumbers.map((number) => [contactId, number]);

            db.query(insertPhoneNumbersQuery, [phoneNumberValues], (err) => {
                if (err) {
                    console.error('Error updating phone numbers:', err);
                    return res.status(500).json({ message: 'Error updating phone numbers' });
                }

                return res.status(200).json({ message: 'Contact updated successfully' });
            });
        });
    });
});

// ... API endpoints will go here ...

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

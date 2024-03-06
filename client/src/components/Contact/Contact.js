import { MainLayout } from '../Layout';
import { useStyles } from './ContactMUI';
import TextField from '@mui/material/TextField';
import { API_ENDPOINT } from '../../constants';
import { Card, CardContent } from '@mui/material';
import { Footer } from '../Elements/Footer';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { useState } from 'react';
import axios from 'axios';

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  message: ''
};

const requiredValues = ['firstName', 'lastName', 'email'];

const email = new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');

export const ContactPage = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState(defaultValues);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    setFormValues({ ...formValues, [name]: value });
  };

  const sendEmail = async () => {
    const errors = {};
    const required = 'This field is required.';

    requiredValues.forEach((key) => {
      if (!formValues[key]) {
        errors[key] = required;
      }
    });

    if (!!formValues.email && !email.test(formValues.email)) {
      errors.email = 'This field is invalid.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        setLoading(true);

        await axios.post(`${API_ENDPOINT}email`, formValues);
        setFormValues(defaultValues);
        window.alert('Message successfully sent!');
      } catch (error) {
        window.alert('Error while sending message. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <MainLayout>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <div className={classes.row}>
            <TextField
              required
              id="firstName"
              name="firstName"
              label="First name"
              fullWidth
              variant="standard"
              value={formValues.firstName}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              onChange={handleChange}
            />
            <TextField
              required
              id="lastName"
              name="lastName"
              label="Last name"
              fullWidth
              variant="standard"
              value={formValues.lastName}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              onChange={handleChange}
            />
          </div>
          <TextField
            required
            id="email"
            name="email"
            label="Email address"
            fullWidth
            type="email"
            variant="standard"
            value={formValues.email}
            error={!!formErrors.email}
            helperText={formErrors.email}
            onChange={handleChange}
          />
          <TextField
            id="message"
            name="message"
            label="Add a message"
            fullWidth
            variant="standard"
            value={formValues.message}
            onChange={handleChange}
          />
          <LoadingButton
            className={classes.submitButton}
            variant="contained"
            loading={loading}
            onClick={sendEmail}
          >
            Submit
          </LoadingButton>
        </CardContent>
      </Card>
      <Footer />
    </MainLayout>
  );
};

const sharedEmail = `test-${Date.now()}@example.com`;

export const userRegisterPayload = {
  first_name: 'John',
  last_name: 'Doe',
  address: {
    street: 'Street 1',
    city: 'City',
    state: 'State',
    country: 'Country',
    postal_code: '1234AA',
  },
  phone: '0987654321',
  dob: '1970-01-01',
  password: 'SuperSecure@123',
  email: sharedEmail,
};

export const userLoginPayload = {
  email: `test-1776918945735@example.com`,
  password: `SuperSecure@123`,
};

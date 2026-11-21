// Single palette for tailwind.config.js and for places that need raw values
// (toast styles, QR code, <meta name="theme-color">).
const colors = {
  page: '#02191D',
  card: '#041E23',
  panel: '#08252B',
  well: '#052228',
  ticket: '#08343C',
  ink: '#0A0C11',
  line: {
    DEFAULT: '#197686',
    muted: '#0E464F',
    subtle: '#07373F',
    ticket: '#12464E',
    card: '#133D44',
  },
  muted: '#B3B3B3',
  subtle: '#D9D9D9',
  danger: '#FF8A80',
};

module.exports = { colors, defaultAccent: '#24A0B5' };

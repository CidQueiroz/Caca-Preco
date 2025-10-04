import { StyleSheet } from 'react-native';

export const cores = {
  primaria: '#FF8383',
  secundaria: '#FFF574',
  terciaria: '#A1D6CB',
  hover: '#A19AD3',
  fundo: '#fdeff2',
  texto: '#333',
  branco: '#fff',
  sucesso: '#28a745',
  perigo: '#dc3545',
};

export const fontes = {
  primaria: 'KronaOne-Regular',
  secundaria: 'Montserrat-Regular',
  semiBold: 'Montserrat-SemiBold',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: fontes.primaria,
    color: cores.primaria,
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontFamily: fontes.secundaria,
    color: cores.texto,
    lineHeight: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: fontes.semiBold,
    color: cores.texto,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontFamily: fontes.secundaria,
    color: cores.texto,
    marginBottom: 10,
    backgroundColor: cores.branco,
  },
  // Estilos de botão base
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // Pode ser ajustado individualmente nos componentes
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    elevation: 5,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
  },
  buttonPrimary: {
    backgroundColor: cores.primaria,
  },
  buttonSecondary: {
    backgroundColor: cores.terciaria,
  },
  buttonSuccess: {
    backgroundColor: cores.sucesso,
  },
  buttonDanger: {
    backgroundColor: cores.perigo,
  },
  buttonText: {
    color: cores.branco,
    fontSize: 18,
    fontFamily: fontes.semiBold,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'repeat',
  },
});

// Forçando uma atualização para o bundler
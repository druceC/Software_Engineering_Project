import * as React from 'react';
import { TextInput } from 'react-native-paper';

// Screen Function for Therapy Menu -> Build on here for the Questionnaire (Druce)


export const BlankPage = () => {
  const [text, setText] = React.useState("");

  return (
    <TextInput
      label="Email"
      value={text}
      onChangeText={text => setText(text)}
    />
  )
}

const styles = require('../../style');
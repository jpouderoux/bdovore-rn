/* Copyright 2021 Joachim Pouderoux & Association Bdovore
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from "react-native-splash-screen";
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";

import MainTab from './routes/MainTab';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { rebuildSheet } from './styles/CommonStyles';
import * as Helpers from './api/Helpers';


const App: () => Node = () => {

  useEffect(() => {
    SplashScreen.hide();

    if (Platform.OS == 'ios') {
      global.hideSponsoredLinks = true;
    } else {
      AsyncStorage.getItem('hideSponsoredLinks').then((value) => {
        global.hideSponsoredLinks = (value == 'true');
      }).catch(() => { });
    }
  });

  global.isDarkMode = useColorScheme() === 'dark';
  rebuildSheet();

  // Subscribe
  NetInfo.addEventListener(state => {
    console.log("Connection type", state.type);
    console.log("Is connected?", state.isConnected);
    //global.isConnected = state.isConnected;
    global.isConnected = false;// state.type == 'wifi';
    Helpers.showToast(false, 'Connexion ' + state.type + (state.isConnected ? ' activée' : ' désactivée'));
  });

  /* TODO - Support dynamic theme change.
  Appearance.addChangeListener(({ colorScheme }) => {
    //global.isDarkMode = colorScheme === 'dark'; // We
    rebuildSheet();
    //console.debug("Appearance changed: " + colorScheme);
  });*/

  return (
    <NavigationContainer theme={global.isDarkMode ? DarkTheme : DefaultTheme}>
      <MainTab />
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </NavigationContainer>
  );
};


export default App;

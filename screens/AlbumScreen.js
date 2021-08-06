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

import React, { useState, useEffect } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { BottomSheet, ListItem } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';

import * as APIManager from '../api/APIManager';
import * as Helpers from '../api/Helpers';
import { CommonStyles } from '../styles/CommonStyles';
import { AchatSponsorIcon } from '../components/AchatSponsorIcon';
import { CollectionMarkers } from '../components/CollectionMarkers';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { RatingStars } from '../components/RatingStars';
import CollectionManager from '../api/CollectionManager';
import { CoverImage } from '../components/CoverImage';


function AlbumScreen({ route, navigation }) {

  const [albumEditionsData, setAlbumEditionsData] = useState([]);
  const [editionIndex, setEditionIndex] = useState(0);
  const [editionsLoaded, setEditionsLoaded] = useState(false);
  const [errortext, setErrortext] = useState('');
  const [album, setAlbum] = useState(route.params.item);
  const [loading, setLoading] = useState(false);
  const [showEditionsChooser, setShowEditionsChooser] = useState(0);
  const [similAlbums, setSimilAlbums] = useState([]);
  const [comments, setComments] = useState([]);
  const [dontShowSerieScreen, setDontShowSerieScreen] = useState(route.params.dontShowSerieScreen);

  const tome = ((album.NUM_TOME !== null) ? 'T' + album.NUM_TOME + ' - ' : '') + album.TITRE_TOME;

  useEffect(() => {
    getAlbumEditions();
  }, []);

  const getAlbumEditions = () => {
    if (!editionsLoaded) {
      setLoading(true);
      setEditionsLoaded(true);
      setSimilAlbums([]);
      CollectionManager.fetchAlbumEditions(album, onAlbumEditionsFetched);
      APIManager.fetchSimilAlbums(album.ID_TOME, onSimilFetched);
      APIManager.fetchAlbumComments(album.ID_TOME, onCommentsFetched);
    }
  }

  const onAlbumEditionsFetched = (result) => {
    setAlbumEditionsData(result.items);
    setErrortext(result.error);
    setLoading(false);
  }

  const onSimilFetched = (result) => {
    setSimilAlbums(result.items);
    setErrortext(result.error);
    setLoading(false);
  }

  const onCommentsFetched = (result) => {
    setComments(result.items);
    setErrortext(result.error);
    setLoading(false);
  }

  const onShowEditionsChooser = () => {
    setShowEditionsChooser(albumEditionsData.length > 1);
  }

  const onChooseEdition = (index) => {
    setShowEditionsChooser(false);
    setEditionIndex(index);
    setAlbum(albumEditionsData[index]);
  }

  const onSimilPress = (item) => {
    navigation.push('Album', { item });
  }

  const onUserComment = async () => {
    AsyncStorage.getItem('pseudo').then(pseudo => {
      let comment = '';
      let rate = 5;
      comments.forEach(entry => {
        if (entry.username == pseudo) {
          //console.log('Found user comment ! ' + comment.COMMENT);
          comment = entry.COMMENT;
          rate = entry.NOTE;
        }
      });
      navigation.push('UserComment', { album, rate, comment });
    }).catch(error => { });
  }

  const onShowSerieScreen = async () => {

    setLoading(true);
    APIManager.fetchSerie(album.ID_SERIE, (result) => {
      setLoading(false);
      if (result.error == '') {
        navigation.push('Serie', { item: result.items[0] });
      }
    });
  }

  const renderSimil = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => onSimilPress(item)} title={item.TITRE_TOME}>
        <CoverImage source={APIManager.getAlbumCoverURL(item)} />
      </TouchableOpacity>);
  }

  return (
    <View style={CommonStyles.screenStyle}>
      <ScrollView style={{ margin: 10 }}>
        <View style={{ margin: 10, alignItems: 'center' }}>
          <CoverImage source={APIManager.getAlbumCoverURL(album)} style={CommonStyles.fullAlbumImageStyle} />
        </View>
        <View style={{ margin: 0, alignItems: 'center' }}>
          <Text h4 style={[CommonStyles.bold, { fontWeight: 'bold', textAlign: 'center' }]}>{tome}</Text>
          <RatingStars note={album.MOYENNE_NOTE_TOME} />
          {comments.length > 0 ?
            <Text style={[CommonStyles.linkTextStyle, { color: 'dodgerblue', marginTop: 10, marginBottom: 10 }]}
            onPress={() => { navigation.push('Comments', { comments }); }}>
              Lire les avis
            </Text> : null}
          {loading ? LoadingIndicator() : null}
        </View>
        <View style={{ marginTop: 10, marginBottom: 10, alignItems: 'center' }}>
          <Text style={[CommonStyles.sectionStyle, CommonStyles.center, CommonStyles.largerText, { color: 'white' }]}>Collection</Text>
          <CollectionMarkers item={album} />
          <Text style={[CommonStyles.sectionStyle, CommonStyles.center, CommonStyles.largerText, { color: 'white' }]}>Info Album</Text>
        </View>
        <View>
          <Text style={CommonStyles.largerText}>{album.NOM_SERIE}</Text>
          {dontShowSerieScreen ? null :
            <Text style={[CommonStyles.linkTextStyle, { color: 'dodgerblue', marginTop: 10, marginBottom: 10 }]}
              onPress={onShowSerieScreen}>
              Voir la fiche série
            </Text>}
          <Text>Auteur(s) : {Helpers.getAuteurs(album)}</Text>
          <Text>Genre : {album.NOM_GENRE}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text>Edition(s) : </Text>
            <TouchableOpacity
              onPress={onShowEditionsChooser}
              title="Editions">
              <Text style={{ borderWidth: 1, borderRadius: 5, backgroundColor: 'lightgrey' }}>
                {' '}{album.NOM_EDITION}{' '}
              </Text>
            </TouchableOpacity>
          </View>
          <AchatSponsorIcon album={album} />
          <Text style={{ marginTop: 10 }}>{Helpers.removeHTMLTags(album.HISTOIRE_TOME)}</Text>
          {CollectionManager.isAlbumInCollection(album) ?
            <Text style={[CommonStyles.linkTextStyle, { color: 'dodgerblue', marginTop: 10, marginBottom: 10 }]}
              onPress={onUserComment}>
              Noter / commenter cet album
            </Text> : null}
        </View>
        {errortext != '' ? (
          <Text style={CommonStyles.errorTextStyle}>
            {errortext}
          </Text>
        ) : null}
        {similAlbums.length > 0 ?
          <View style={{ marginTop: 10, marginBottom: 10, alignItems: 'center' }}>
            <Text style={[CommonStyles.sectionStyle, CommonStyles.center, CommonStyles.largerText, { color: 'white', marginBottom: 10 }]}>A voir aussi</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              legacyImplementation={false}
              data={similAlbums}
              renderItem={renderSimil}
              keyExtractor={({ item }, index) => index}
              style={{ height: 120 }}
            />
          </View> : null}


        {/* Editions chooser */}
        <BottomSheet
          isVisible={showEditionsChooser}
          containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)' }}>
          <ListItem key='0'>
            <ListItem.Content>
              <ListItem.Title>Editions</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          {albumEditionsData.map((item, index) => (
            <ListItem key={index + 1}
              containerStyle={
                (index == editionIndex ? { backgroundColor: 'dodgerblue' } : { backgroundColor: 'white' })}
              onPress={() => {
                onChooseEdition(index);
              }}>
              <ListItem.Content>
                <ListItem.Title style={
                  (index == editionIndex ? { color: 'white' } : { color: 'dodgerblue' })}>
                  {item.NOM_EDITION}
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))}
        </BottomSheet>

      </ScrollView>
    </View>
  );
}

export default AlbumScreen;

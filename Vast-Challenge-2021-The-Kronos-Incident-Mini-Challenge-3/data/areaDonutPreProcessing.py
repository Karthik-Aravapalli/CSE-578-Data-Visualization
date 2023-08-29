import pandas as pd
from datetime import datetime

df1 = pd.read_csv("sentiments.csv")

df2 = df1.drop(['type', 'message', 'sentiment', 'sentiment_score'], axis=1)
df2["timestamp"] = pd.to_datetime(df2["timestamp"], format="%Y%m%d%H%M%S")
df2["timestamp"] = df2["timestamp"].dt.strftime("%H%M%S")

source_types = {'KronosQuoth': 'Spam',
                'OnlytheTruth': 'Spam',
                'rockinHW': 'Spam',
                'Officia1AbilaPost': 'Spam',
                'AbilaPost': 'Journalistic Sources',
                'CentralBulletin': 'Journalistic Sources',
                'InternationalNews': 'Journalistic Sources',
                'NewsOnlineToday': 'Journalistic Sources',
                # 'HomelandIlluminations': 'Biased Reporting',
                # 'FriendsOfKronos': 'Biased toward government',
                'HomelandIlluminations': 'Biased',
                'FriendsOfKronos': 'Biased',
                'megaMan': 'On the Scene',
                'panopticon': 'On the Scene',
                'roger_roger': 'On the Scene',
                'Sara_Nespola': 'On the Scene',
                'prettyRain': 'On the Scene',
                'protoGuy': 'On the Scene',
                'SiaradSea': 'On the Scene',
                'Simon_Hamaeth': 'On the Scene',
                'Sofitees': 'On the Scene',
                'truccotrucco': 'On the Scene',
                'microBanana': 'On the Scene',
                'mountain478': 'On the Scene'
                }

df2['source_types'] = df2['author'].map(source_types).fillna('Official Source')
df2.loc[~df2['author'].isin(source_types.keys()) & df2['author'].notnull(), 'source_types'] = 'Unclassified'

df2.to_csv('areaDonut_tweetCategory.csv', encoding='utf-8', index=False)
# run this file after innovativeChartPreprocessing1.py, this file aggregates the number of times a tweet has been retweeted

import pandas as pd

final_df = pd.read_csv("innovativeRawData.csv", names=["time", "author", "message"], header=0)

final_df = final_df.assign(RT_count=0)

print(final_df)

rt_counts = {}

retweets = 0

for index, row in final_df.iterrows():

    if row["message"].startswith("RT "):
        # first 3 postions are RT<space>
         rt_text = row["message"][3:]
         rt_parts = rt_text.split(" ", 1)
         original_author = rt_parts[0]
         original_message = rt_parts[1]

         rt_counts[original_message] += 1
         retweets += 1

    elif row["message"].startswith("\"RT "):
        # first 4 positions are "RT<space>
        rt_text = row["message"][4:]
        rt_parts = rt_text.split(" ", 1)
        original_author = rt_parts[0]
        original_message = "\"" + rt_parts[1]
        rt_counts[original_message] += 1
        retweets += 1

    else:
        rt_counts[row["message"]] = 0


print("Total Retweets: ", retweets)
# print(rt_counts)

for index, row in final_df.iterrows():
    if not row["message"].startswith("RT "):
        # print(row["message"], rt_counts[row["message"]])
        final_df.at[index, "RT_count"] = rt_counts[row["message"]]

# print(final_df)

final_df['time'] = pd.to_datetime(final_df['time'], format='%Y%m%d%H%M%S')

final_df['time'] = final_df['time'].dt.time.astype(str)

final_df.to_csv('innovativeFinalData.csv', index=False)
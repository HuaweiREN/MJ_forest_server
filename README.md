# MJ_forest_server
 
Achievement: Wechat Mini-game Top 20 teams (out of 644 teams in total)
Platform: WeChat Mini-game
Engine: WeChat Developer Tool
Language: Javascript
Author: JZR, RHW
Email: ravidren@126.com
For applying internal testing authorization, please use WeChat and scan the QR Code down below.  

<img src="https://github.com/HuaweiREN/MJ_Forest/blob/master/pics/QR%20Code.png" width = "200" alt="" align=center />

MJ_forest, is a mini-game running on WeChat platform. It combines the round strategy with the education experience.  

From the code architecture view, it can be divided into mainly 2 parts: online (server side) and offline (local side). The codes to the local side can be found here:  

url: https://github.com/HuaweiREN/MJ_Forest  

In this repository, server code is included. If you want to implement it to your project. Please feel free to deploy them on your WeChat developer tool.

# Attachments:
## Introduction

MJ_forest is a WeChat Mini-game with round-based strategy and education experience.  

![image](https://github.com/HuaweiREN/MJ_Forest/blob/master/pics/game_introduction.PNG)    

In this mini-game, the player target at utilizing different methods to collect the resources (food & gold) as much as possible. The resources are again can be used to “gamble” with other players in an open market, or to grow up their pets. A higher level pet would bring back better talents and earn more feedbacks via pet’s activity. All the players would be ranked through their pets’ level and experience.  

The whole game is a metaphor to people’s daily life. Somehow we are using our resources to earn our individual/family a better living environment. Furthermore, parts of them are eager to be outstanding, which means either they would have massy resources, or they would make themselves / their children being the best among the living circle. Thus, if we make a projection to this mini-game, we will find that the resources (in reality) are pointing at the food/gold (in game). They or their children (in reality) are pointing at the pet level and experience (in game).  

The mini-game has 3 major systems and 10+ minor subsystems. 

**The major systems include:**  
- A demand-supply equilibrium model  
- An activity-feedback close loop  
- AI (with DQN loaded) robot model  

**The minor subsystems include:**
-	A “bank” (where player can deposit and withdraw their gold to gain interest)
-	A “barn” (where player can get their harvest day award)
-	A news station (where player can listen to the daily news broadcast which are indicating the resources tendency)
-	An underground market (where player can trade their resources within friend circle rather than put them into the world trade pool)
-	A welfare system (where player can get some resources welfare if they meet some specific requirements)
-	A calendar system (where there is a time projection between the real time and the game time)
-	A user task system (where player are able to get extra resources after finishing some specific tasks)
-	A pet dictionary system (where all the pets introduction and talents are listed)
-	A rank system (where player can check their rank in the friend circle or the whole game world)
-	A feeding system (where player can grow up their pets)
-	A live bell system (where player can shake the live bell and increase the pet liveness)
-	An activity system (where player can assign the activities to their pets and if the activity has been finished successfully, the pet would bring back extra resources)

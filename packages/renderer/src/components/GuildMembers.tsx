import { Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import { GuildInfo } from "packages/UpdatedIpc";
import { FC } from "react";
import Badge from '@mui/material/Badge';
import { Box } from "./Box";
import styles from "@/styles/guild_members.module.scss";
import { GuildMember, User } from "discord.js";


function iconColor (member: GuildMember | undefined) {
  console.log(member)
  const presence = member?.presence?.status;
  console.log(presence)
  if (!member || !presence) return "secondary"
  if (presence === "dnd") return "error"
  if (presence === "online") return "success"
  if (presence === "idle") return "warning"
  if (presence === "invisible") return "primary"
  return "secondary"
}

interface Props {
  guild: GuildInfo
}
export const GuildMembers: FC<Props> = ({ guild }) => {

  console.log(guild)
  return <Box>
    <h2>
      Members
    </h2>
    <List
      className={styles.list}
      sx={{ maxHeight: '40vh', bgcolor: 'background.paper' }}
    >
      {guild.users.map(user => <>
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Badge anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }} color={iconColor(guild.members.get(user.id))} badgeContent=" " overlap="circular" classes="PenusXXX">
              <Avatar alt={user.username} src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} />
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={user.username}
            secondary={
              <>#{user.discriminator}</>
            }
          />
        </ListItem>
        {(guild.users[guild.users.length - 1] !== user) ? <Divider variant="inset" component="li" /> : ""}
      </>
      )}
    </List>
  </Box>
}
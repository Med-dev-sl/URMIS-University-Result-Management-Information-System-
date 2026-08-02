import { Card, CardContent, Stack, Typography } from '@mui/material'

export default function AuthCard({ title, subtitle, children, icon }) {
  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {icon}
            <div>
              <Typography variant="h6">{title}</Typography>
              <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
            </div>
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}

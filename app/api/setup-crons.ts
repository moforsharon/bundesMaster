// app/api/setup-crons.ts
import cron from 'node-cron';
import { NextResponse } from 'next/server';

let cronJobsInitialized = false;

export async function GET() {
  if (!cronJobsInitialized) {
    // Daily reminder at 9 AM
    cron.schedule('0 9 * * *', async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/challenge-reminders?secret=${process.env.CRON_SECRET}`);
        console.log('Daily reminder cron job executed');
      } catch (error) {
        console.error('Error executing cron job:', error);
      }
    });
    
    // Check every 5 minutes for 10-minute reminders
    cron.schedule('*/5 * * * *', async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/challenge-reminders?secret=${process.env.CRON_SECRET}`);
        console.log('10-minute reminder check executed');
      } catch (error) {
        console.error('Error executing cron job:', error);
      }
    });
    
    cronJobsInitialized = true;
    console.log('Cron jobs initialized');
  }
  
  return NextResponse.json({ success: true, message: 'Cron jobs initialized' });
}
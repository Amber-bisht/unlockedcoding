import { connectDB } from '../config/database';
import { LoginActivity } from '../models';
import { logger } from '../utils/logger';

async function monthlyCleanup() {
  try {
    await connectDB();
    logger.info('Starting monthly login data cleanup...');

    // Get current month start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    logger.info(`Current month: ${currentMonthStart.toISOString()} to ${currentMonthEnd.toISOString()}`);

    // Delete all login activity data older than current month
    const deleteResult = await LoginActivity.deleteMany({
      loginDate: {
        $lt: currentMonthStart
      }
    });

    logger.info(`Deleted ${deleteResult.deletedCount} old login activity records`);

    // Get current month data for verification
    const currentMonthData = await LoginActivity.find({
      loginDate: {
        $gte: currentMonthStart,
        $lte: currentMonthEnd
      }
    });

    logger.info(`Current month has ${currentMonthData.length} login activity records`);

    // Show summary by day for current month
    const dailySummary = await LoginActivity.aggregate([
      {
        $match: {
          loginDate: {
            $gte: currentMonthStart,
            $lte: currentMonthEnd
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$loginDate" }
          },
          totalLogins: { $sum: "$loginCount" },
          uniqueUsers: { $addToSet: "$userId" }
        }
      },
      {
        $project: {
          date: "$_id",
          totalLogins: 1,
          uniqueUsers: { $size: "$uniqueUsers" }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    logger.info('Current month daily summary:');
    dailySummary.forEach(day => {
      logger.info(`${day.date}: ${day.totalLogins} logins from ${day.uniqueUsers} users`);
    });

    logger.info('Monthly cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during monthly cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// Run the cleanup
monthlyCleanup(); 
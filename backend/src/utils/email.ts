import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'uwedding.online@gmail.com',
      pass: process.env.EMAIL_PASS || '', 
    },
  });
};

export const sendBookingConfirmation = async (email: string, booking: any) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Travel Booking" <${process.env.EMAIL_USER || 'uwedding.online@gmail.com'}>`,
      to: email,
      subject: `Xác nhận đặt dịch vụ thành công - Mã vé: ${booking.bookingCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Xác Nhận Đặt Chỗ Thành Công</h1>
          </div>
          <div style="padding: 20px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #334155;">Chào <strong>${booking.customerInfo.name}</strong>,</p>
            <p style="font-size: 16px; color: #334155;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Đơn đặt chỗ của bạn đã được ghi nhận thành công.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0f172a;">Thông tin chi tiết</h3>
              <p style="margin: 5px 0;"><strong>Mã Đơn:</strong> <span style="color: #2563eb; font-weight: bold;">${booking.bookingCode}</span></p>
              <p style="margin: 5px 0;"><strong>Loại dịch vụ:</strong> ${booking.type.toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Ngày bắt đầu:</strong> ${new Date(booking.travelDate || booking.checkIn).toLocaleDateString('vi-VN')}</p>
              <p style="margin: 5px 0;"><strong>Số lượng khách:</strong> ${booking.guests?.adults || 0} Người lớn, ${booking.guests?.children || 0} Trẻ em</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 10px 0;" />
              <p style="margin: 5px 0; font-size: 18px;"><strong>Tổng thanh toán:</strong> <span style="color: #ea580c; font-weight: bold;">${booking.totalPrice.toLocaleString('vi-VN')} VNĐ</span></p>
            </div>

            <p style="font-size: 14px; color: #64748b;">
              Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email này hoặc gọi hotline hỗ trợ.
            </p>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Travel Booking System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

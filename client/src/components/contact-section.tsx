import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertMessageSchema, insertEnrollmentSchema } from "@/lib/types";
import { MapPin, Phone, MessageCircle, Mail, Send } from "lucide-react";
import { z } from "zod";

const contactFormSchema = insertMessageSchema;
const enrollmentFormSchema = insertEnrollmentSchema;

export default function ContactSection() {
  const [activeTab, setActiveTab] = useState<'contact' | 'enroll'>('contact');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const contactForm = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const enrollmentForm = useForm<z.infer<typeof enrollmentFormSchema>>({
    resolver: zodResolver(enrollmentFormSchema),
    defaultValues: {
      childName: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      childAge: 5,
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contactFormSchema>) => {
      await apiRequest('POST', '/api/messages', data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Thank you for your message! We will get back to you soon.",
      });
      contactForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const enrollmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof enrollmentFormSchema>) => {
      await apiRequest('POST', '/api/enrollments', data);
    },
    onSuccess: () => {
      toast({
        title: "Enrollment Submitted",
        description: "Your enrollment request has been submitted successfully. We will contact you soon.",
      });
      enrollmentForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit enrollment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onContactSubmit = (data: z.infer<typeof contactFormSchema>) => {
    contactMutation.mutate(data);
  };

  const onEnrollmentSubmit = (data: z.infer<typeof enrollmentFormSchema>) => {
    enrollmentMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-20 bg-surface" data-testid="contact-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-textPrimary mb-4" data-testid="contact-title">
            Get In Touch
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="space-y-8">
              <div className="flex items-start space-x-4" data-testid="contact-address">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-textPrimary mb-2">Address</h3>
                  <p className="text-textSecondary">Seriki Soyinka, Ifo, Ogun State, Nigeria</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4" data-testid="contact-phone">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-textPrimary mb-2">Phone Numbers</h3>
                  <p className="text-textSecondary">08037906249 / 08107921359</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4" data-testid="contact-whatsapp">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-textPrimary mb-2">WhatsApp</h3>
                  <p className="text-textSecondary">08107921359</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4" data-testid="contact-email">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-textPrimary mb-2">Email</h3>
                  <p className="text-textSecondary">treasurehomeschool@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="bg-backgroundSurface">
            <CardContent className="p-8">
              {/* Tab Navigation */}
              <div className="flex mb-6" data-testid="contact-tabs">
                <Button
                  variant={activeTab === 'contact' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('contact')}
                  className="flex-1 mr-2"
                  data-testid="tab-contact"
                >
                  Send Message
                </Button>
                <Button
                  variant={activeTab === 'enroll' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('enroll')}
                  className="flex-1 ml-2"
                  data-testid="tab-enroll"
                >
                  Enroll Now
                </Button>
              </div>

              {activeTab === 'contact' ? (
                <Form {...contactForm}>
                  <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6" data-testid="contact-form">
                    <FormField
                      control={contactForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              {...field} 
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={contactForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email" 
                              {...field} 
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={contactForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={5} 
                              placeholder="Tell us how we can help you" 
                              {...field} 
                              data-testid="input-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-blue-700 text-white"
                      disabled={contactMutation.isPending}
                      data-testid="button-submit-contact"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...enrollmentForm}>
                  <form onSubmit={enrollmentForm.handleSubmit(onEnrollmentSubmit)} className="space-y-6" data-testid="enrollment-form">
                    <FormField
                      control={enrollmentForm.control}
                      name="childName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Child's Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter child's full name" 
                              {...field} 
                              data-testid="input-child-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={enrollmentForm.control}
                      name="childAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Child's Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="3" 
                              max="18" 
                              placeholder="Enter child's age" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-child-age"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={enrollmentForm.control}
                      name="parentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent/Guardian Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter parent/guardian name" 
                              {...field} 
                              data-testid="input-parent-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={enrollmentForm.control}
                      name="parentEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter parent email" 
                              {...field} 
                              data-testid="input-parent-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={enrollmentForm.control}
                      name="parentPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="Enter parent phone number" 
                              {...field} 
                              data-testid="input-parent-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-orange-600 text-white"
                      disabled={enrollmentMutation.isPending}
                      data-testid="button-submit-enrollment"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {enrollmentMutation.isPending ? 'Submitting...' : 'Submit Enrollment'}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

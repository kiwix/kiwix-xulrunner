//
//  ViewController.m
//  KiwixTest
//
//  Created by Chris Li on 8/1/14.
//  Copyright (c) 2014 Chris. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()

@property (strong, nonatomic)zimReader *reader;
@property (weak, nonatomic) IBOutlet UILabel *titleOfTheBook;
@property (weak, nonatomic) IBOutlet UILabel *dateOfTheBook;

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    NSURL *resourceURL = [[NSBundle mainBundle] URLForResource:@"Book about Aviation" withExtension:@"zim"];
    self.reader = [[zimReader alloc] initWithZIMFileURL:resourceURL];
    self.titleOfTheBook.text = [self.reader getTitle];
    self.dateOfTheBook.text = [self.reader getDate];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
